import 'reflect-metadata';
import { Express, json } from 'express'

import { createAcator, openGRPCConnection, agencyv1 } from '@findy-network/findy-common-ts'
import { v4 as uuidv4 } from 'uuid'

import { static as stx } from 'express'
import { createExpressServer, useContainer } from 'routing-controllers'
import { Container } from 'typedi'
import type { Socket } from 'net'

import { Server } from 'ws'

import { CredDefService } from './controllers/CredDefService'
import { TestLogger } from './utils/logger'
import { sendWebSocketEvent } from './WebSocketEvents'

const logger = new TestLogger(2) // debug
const socketServer = new Server({ noServer: true })

process.on('unhandledRejection', (error) => {
  if (error instanceof Error) {
    logger.fatal(`Unhandled promise rejection: ${error.message}`, { error })
  } else {
    logger.fatal('Unhandled promise rejection due to non-error error', {
      error,
    })
  }
})

const setupFindyAgency = async () => {
  const acatorProps = {
    authUrl: process.env.AGENCY_AUTH_URL!,
    authOrigin: process.env.AGENCY_AUTH_ORIGIN!,
    userName: process.env.AGENCY_USER_NAME!,
    seed: process.env.AGENCY_PUBLIC_DID_SEED!,
    key: process.env.AGENCY_KEY!,
  }
  const authenticator = createAcator(acatorProps)

  const grpcProps = {
    serverAddress: process.env.SERVER_ADDRESS!,
    serverPort: parseInt(process.env.SERVER_PORT!, 10),
    certPath: process.env.SERVER_CERT_PATH!,
  }

  // Authenticate and open GRPC connection to agency
  return openGRPCConnection(grpcProps, authenticator)
}

const run = async () => {
  const agencyConnection = await setupFindyAgency()
  const { createAgentClient, createProtocolClient } = agencyConnection
  const agentClient = await createAgentClient()
  const protocolClient = await createProtocolClient()
  const connectionsDone: string[] = []
  const credentialsDone: { [key: string]: string } = {}
  const proofsDone: { [key: string]: { status: string; attributes?: { name: string; value: string }[] } } = {}

  await agentClient.startListeningWithHandler(
    {
      DIDExchangeDone: (info) => {
        connectionsDone.push(info.connectionId)
        sendWebSocketEvent(socketServer, {
          type: 'ConnectionStateChanged',
          payload: {
            connectionRecord: { outOfBandId: info.connectionId, id: info.connectionId, state: 'response-sent' },
          },
        })
      },
      IssueCredentialDone: (info, data) => {
        credentialsDone[info.protocolId] = 'done'
        sendWebSocketEvent(socketServer, {
          type: 'CredentialStateChanged',
          payload: {
            credentialRecord: {
              id: info.protocolId,
              state: 'done',
              connectionId: info.connectionId,
              metadata: {
                '_internal/indyCredential': {
                  schemaId: 'TODO',
                  credentialDefinitionId: data.getCredDefid(),
                },
              },
            },
          },
        })
      },
      PresentProofPaused: async (info, presentProof) => {
        const protocolID = new agencyv1.ProtocolID()
        protocolID.setId(info.protocolId)
        protocolID.setTypeid(agencyv1.Protocol.Type.PRESENT_PROOF)
        protocolID.setRole(agencyv1.Protocol.Role.RESUMER)
        const msg = new agencyv1.ProtocolState()
        msg.setProtocolid(protocolID)
        msg.setState(agencyv1.ProtocolState.State.ACK)
        await protocolClient.resume(msg)

        proofsDone[info.protocolId].attributes = presentProof
          .getProof()
          ?.getAttributesList()
          .map((attr) => ({ name: attr.getName(), value: attr.getValue() }))
      },
      PresentProofDone: (info, data) => {
        proofsDone[info.protocolId].status = 'done'
        sendWebSocketEvent(socketServer, {
          type: 'ProofStateChanged',
          payload: {
            proofRecord: {
              id: info.protocolId,
              state: 'presentation-received',
              connectionId: info.connectionId,
              attributes: proofsDone[info.protocolId].attributes,
            },
          },
        })
      },
    },
    {
      protocolClient,
      retryOnError: true,
    }
  )

  const app: Express = createExpressServer({
    controllers: [__dirname + '/controllers/**/*.ts', __dirname + '/controllers/**/*.js'],
    cors: true,
    routePrefix: '/demo',
  })

  app.use(json())

  app.use('/public', stx(__dirname + '/public'))

  const credDefService = new CredDefService(agentClient)
  useContainer(Container)
  Container.set(CredDefService, credDefService)

  app.get('/server/last-reset', async (req, res) => {
    res.send(new Date())
  })

  app.use((req, res, next) => {
    console.log('REQUEST:', req.path, req.query)
    next()
  })

  app.post('/oob/create-legacy-invitation', async (req, res) => {
    const id = uuidv4().toString()
    const msg = new agencyv1.InvitationBase()
    msg.setLabel(req.body.label || "Demo Government")
    msg.setId(id)

    const invitation = await agentClient.createInvitation(msg)

    console.log('Created invitation with Findy Agency:', invitation.getUrl())

    return res.json({
      invitationUrl: invitation.getUrl(),
      outOfBandRecord: {
        id,
      },
    })
  })

  app.get('/connections', async (req, res) => {
    console.log(req.query.outOfBandId)
    const id = req.query.outOfBandId?.toString() || ''
    const foundConnections = connectionsDone.includes(id) ? [{ id, state: 'response-sent' }] : []
    res.json(foundConnections)
  })

  app.post('/credentials/offer-credential', async (req, res, next) => {
    const attributes = new agencyv1.Protocol.IssuingAttributes()
    req.body.credentialFormats.indy.attributes.map((item: { name: string; value: string }) => {
      const attr = new agencyv1.Protocol.IssuingAttributes.Attribute()
      attr.setName(item.name)
      attr.setValue(item.value)
      attributes.addAttributes(attr)
      return attr
    })

    const credential = new agencyv1.Protocol.IssueCredentialMsg()
    credential.setCredDefid(req.body.credentialFormats.indy.credentialDefinitionId)
    credential.setAttributes(attributes)

    const issueResult = await protocolClient.sendCredentialOffer(req.body.connectionId, credential)

    credentialsDone[issueResult.getId()] = 'offer-sent'

    return res.json({
      _tags: {},
      metadata: {
        '_internal/indyCredential': {
          schemaId: 'TODO',
          credentialDefinitionId: req.body.credentialFormats.indy.credentialDefinitionId,
        },
      },
      credentials: [],
      id: issueResult.getId(),
      createdAt: new Date().toISOString(),
      state: credentialsDone[issueResult.getId()],
      connectionId: req.body.connectionId,
      threadId: issueResult.getId(),
      protocolVersion: req.body.protocolVersion,
      credentialAttributes: req.body.credentialFormats.indy.attributes,
    })
  })

  app.post('/proofs/request-proof', async (req, res, next) => {
    const attributes = new agencyv1.Protocol.Proof()

    Object.keys(req.body.proofRequestOptions.requestedAttributes).map((item) => {
      const src = req.body.proofRequestOptions.requestedAttributes[item]
      const credDefId = req.body.proofRequestOptions.requestedAttributes[item].restrictions[0].credentialDefinitionId
      if (src.names.length > 0) {
        src.names.forEach((name: string) => {
          const attr = new agencyv1.Protocol.Proof.Attribute()
          attr.setName(name)
          attr.setCredDefid(credDefId)
          attributes.addAttributes(attr)
        })
      } else {
        const attr = new agencyv1.Protocol.Proof.Attribute()
        attr.setName(item)
        attr.setCredDefid(credDefId)
        attributes.addAttributes(attr)
      }
      return item
    })

    const proofRequest = new agencyv1.Protocol.PresentProofMsg()
    proofRequest.setAttributes(attributes)

    const proofRes = await protocolClient.sendProofRequest(req.body.connectionId, proofRequest)

    proofsDone[proofRes.getId()] = { status: 'request-sent', attributes: [] }

    return res.json({
      _tags: {},
      metadata: {},
      id: proofRes.getId(),
      createdAt: new Date().toISOString(),
      state: 'request-sent',
      connectionId: req.body.connectionId,
      threadId: proofRes.getId(),
      protocolVersion: req.body.protocolVersion,
      requestMessage: {},
    })
  })

  app.get('/connections/:id', async (req, res, next) => {
    console.log(req.params.id)
    next()
  })

  const server = app.listen(5000, () => console.log('Started'))
  server.on('upgrade', (request, socket, head) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    socketServer.handleUpgrade(request, socket as Socket, head, () => { })
  })
}

run()

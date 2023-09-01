import { agencyv1, AgentClient } from '@findy-network/findy-common-ts'
import { Service } from 'typedi'

import logger from '../utils/logger'

interface CredDef {
  id: string
  schemaId: string
  type: string
  tag: string
  value: {
    primary: Record<string, unknown>
    revocation?: unknown | undefined
  }
  ver: string
}

@Service()
export class CredDefService {
  private agencyAgent: AgentClient
  private credentialDefinitions: CredDef[] = []
  private schemaPrefix = ''

  public constructor(agencyConnection: AgentClient) {
    this.agencyAgent = agencyConnection
    this.init()
  }

  public getCredentialDefinitionIdByTag(tag: string) {
    const def = this.credentialDefinitions.find((x) => x.tag === tag)

    if (!def) {
      throw new Error(`CredentialDefinition not found for ${tag}`)
    }

    return def.id
  }

  // FIXME: this will break if called concurrently. We need to do this in setup, and agent can't be used until it is done.
  public async getAll() {
    if (this.credentialDefinitions.length === 0) {
      await this.init()
    }
    return this.credentialDefinitions
  }

  public async getAllCredentialsByConnectionId(id: string) {
    logger.debug(id)
    return []
  }

  // TODO: these should be auto-created based on the use cases.
  private async init() {
    if (!this.schemaPrefix) {
      this.schemaPrefix = await this.getSchemaPrefix()
    }
    const cd1 = await this.createSchemaCredentialDefinition({
      schema: {
        attributeNames: ['Name', 'Street', 'City', 'Date of birth', 'Nationality'],
        name: 'Animo ID',
        version: '1.1',
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: 'Animo ID Card',
      },
    })

    const cd2 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'Credit card',
        version: '1.0.0',
        attributeNames: ['Security code', 'Card number', 'Issuer', 'Holder', 'Valid until'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: 'Credit card',
      },
    })

    const cd3 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'Airplane Ticket',
        version: '1.0',
        attributeNames: ['Airline', 'Class', 'Seat', 'Passenger'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: 'Airplane Ticket',
      },
    })

    const cd4 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'Conference Pass',
        version: '1.0.0',
        attributeNames: ['Name', 'Nationality'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: 'Conference Pass',
      },
    })

    const cd5 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'Hotel Keycard',
        version: '1.0.0',
        attributeNames: ['name', 'room'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: 'Hotel Keycard',
      },
    })

    const cd6 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'University Card',
        version: '1.0.2',
        attributeNames: ['Date of birth', 'StudentID', 'Valid until', 'University', 'Faculty', 'Name'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: 'University Card',
      },
    })

    const cd7 = this.createSchemaCredentialDefinition({
      schema: {
        name: "Master's Degree",
        version: '1.0.0',
        attributeNames: ['Graduate', 'Date', 'Field', 'Institute'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: `Master's Degree`,
      },
    })

    const cd8 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'Proof of Employment',
        version: '1.0.0',
        attributeNames: ['Date', 'Organization', 'Title', 'Name'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: `Proof of Employment`,
      },
    })

    const cd9 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'Rent Agreement',
        version: '1.0.1',
        attributeNames: ['Landlord', 'Name', 'Rent', 'Start date', 'End date'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: `Rent Agreement`,
      },
    })

    const cd10 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'Laptop Invoice',
        version: '1.0.1',
        attributeNames: ['Street', 'Store', 'Name', 'City', 'Product', 'Price', 'Date'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: `Laptop Invoice`,
      },
    })

    const cd11 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'Crypto Wallet',
        version: '1.0.2',
        attributeNames: ['Address', 'Balance'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: `Crypto Wallet`,
      },
    })

    const cd12 = this.createSchemaCredentialDefinition({
      schema: {
        name: 'Gym Membership',
        version: '1.0',
        attributeNames: ['Name', 'Valid until', 'Date of birth'],
      },
      credentialDefinition: {
        supportRevocation: false,
        tag: `Gym Membership`,
      },
    })

    this.credentialDefinitions = [cd1]
    Promise.all([cd2, cd3, cd4, cd5, cd6, cd7, cd8, cd9, cd10, cd11, cd12]).then((values) =>
      this.credentialDefinitions.push(...values),
    )
  }

  private async createSchemaCredentialDefinition(options: {
    schema: {
      attributeNames: string[]
      name: string
      version: string
    }
    credentialDefinition: {
      tag: string
      supportRevocation: boolean
    }
  }) {
    logger.info(`Creating schema ${options.schema.name}`)
    const schemaMsg = new agencyv1.SchemaCreate()
    schemaMsg.setName(options.schema.name)
    schemaMsg.setVersion(options.schema.version)
    schemaMsg.setAttributesList(options.schema.attributeNames)

    let schemaId = `${this.schemaPrefix}:${options.schema.name}:${options.schema.version}`
    try {
      schemaId = (await this.agencyAgent.createSchema(schemaMsg)).getId()
    } catch {
      logger.warn(`Schema creation failed, using id ${schemaId}`)
    }

    logger.info(`Creating cred def for schema ID ${schemaId}`)
    const msg = new agencyv1.CredDefCreate()
    msg.setSchemaid(schemaId)
    msg.setTag(options.credentialDefinition.tag)

    const res = await this.agencyAgent.createCredDef(msg)
    logger.info(`Cred def created ${res.getId()}`)

    const resSchemaId = res.getId().substring(0, res.getId().lastIndexOf(':'))
    const credDef = {
      ver: '1.0',
      id: res.getId(),
      schemaId: resSchemaId.substring(schemaId.lastIndexOf(':') + 1, resSchemaId.length),
      type: 'CL',
      tag: options.credentialDefinition.tag,
      value: {
        primary: {},
      },
    }
    return credDef
  }

  // temp hack to avoid storing schema ids
  private async getSchemaPrefix() {
    const schemaMsg = new agencyv1.SchemaCreate()
    schemaMsg.setName('test')
    schemaMsg.setVersion(Date.now().toString())
    schemaMsg.setAttributesList(['test'])
    const schemaId = (await this.agencyAgent.createSchema(schemaMsg)).getId()
    const indexes = schemaId
      .split('')
      .map((letter, index) => (letter === ':' ? index : -1))
      .filter((item) => item >= 0)
    return schemaId.substring(0, indexes[1])
  }
}

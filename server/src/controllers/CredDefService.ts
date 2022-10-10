import { agencyv1, AgentClient } from '@findy-network/findy-common-ts'

import { Service } from 'typedi'

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

  public async getAll() {
    if (this.credentialDefinitions.length === 0) {
      await this.init()
    }
    return this.credentialDefinitions
  }

  public async getAllCredentialsByConnectionId(connectionId: string) {
    console.log('GET ALL CREDENTIALS ' + connectionId)
    // const credentials = await this.agent.credentials.getAll()
    // const filtered = credentials.filter((cred) => cred.connectionId === connectionId)

    // return filtered.map((c) => c.toJSON())
    return []
  }

  private async init() {
    const cd1 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Animo ID:1.1',
      supportRevocation: false,
      tag: 'Animo ID Card',
    })
    // "attributes": [
    //   "Name", "Street", "City", "Date of birth", "Nationality"
    // ]

    const cd2 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Credit card:1.0.0',
      supportRevocation: false,
      tag: 'Credit card',
    })
    //"attrNames": [
    //   "Security code", "Card number", "Issuer", "Holder", "Valid until"
    // ],

    const cd3 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Airplane Ticket:1.0',
      supportRevocation: false,
      tag: 'Airplane Ticket',
    })
    // "attrNames": [
    //   "Airline", "Class", "Seat", "Passenger"
    // ],

    const cd4 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Conference Pass:1.0.0',
      supportRevocation: false,
      tag: 'Conference Pass',
    })
    // "attrNames": [
    //   "Name", "Nationality"
    // ],

    const cd5 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Hotel Keycard:1.0.0',
      supportRevocation: false,
      tag: 'Hotel Keycard',
    })
    // "attrNames": [
    //   "name", "room"
    // ],

    const cd6 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:University Card:1.0.2',
      supportRevocation: false,
      tag: 'University Card',
    })
    // "attrNames": [
    //   "Date of birth", "StudentID", "Valid until", "University", "Faculty", "Name"
    // ],

    const cd7 = await this.createCredentialDefinition({
      schemaId: "q7ATwTYbQDgiigVijUAej:2:Master's Degree:1.0.0",
      supportRevocation: false,
      tag: `Master's Degree`,
    })
    // "attrNames": [
    //   "Graduate", "Date", "Field", "Institute"
    // ],

    const cd8 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Proof of Employment:1.0.0',
      supportRevocation: false,
      tag: `Proof of Employment`,
    })
    // "attrNames": [
    //   "Date", "Organization", "Title", "Name"
    // ]

    const cd9 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Rent Agreement:1.0.1',
      supportRevocation: false,
      tag: `Rent Agreement`,
    })
    // "attributes": [
    //   "Landlord", "Name", "Rent", "Start date", "End date"
    // ]

    const cd10 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Laptop Invoice:1.0.1',
      supportRevocation: false,
      tag: `Laptop Invoice`,
    })
    // "attrNames": [
    //  "Street", "Store", "Name", "City", "Product", "Price", "Date"
    // ]

    const cd11 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Crypto Wallet:1.0.2',
      supportRevocation: false,
      tag: `Crypto Wallet`,
    })
    // "attrNames": [
    //  "Address", "Balance"
    // ]

    const cd12 = await this.createCredentialDefinition({
      schemaId: 'q7ATwTYbQDgiigVijUAej:2:Gym Membership:1.0',
      supportRevocation: false,
      tag: `Gym Membership`,
    })
    // "attrNames": [
    //  "Name", "Valid until", "Date of birth"
    // ],

    this.credentialDefinitions = [cd1, cd2, cd3, cd4, cd5, cd6, cd7, cd8, cd9, cd10, cd11, cd12]
  }

  private async createCredentialDefinition(credentialDefinitionRequest: {
    schemaId: string
    supportRevocation: boolean
    tag: string
  }) {
    console.log('Creating cred def for schema ID', credentialDefinitionRequest.schemaId)
    const msg = new agencyv1.CredDefCreate()
    msg.setSchemaid(credentialDefinitionRequest.schemaId)
    msg.setTag(credentialDefinitionRequest.tag)

    const res = await this.agencyAgent.createCredDef(msg)
    console.log('Cred def created', res.getId())

    const schemaId = res.getId().substring(0, res.getId().lastIndexOf(':'))
    const credDef = {
      ver: '1.0',
      id: res.getId(),
      schemaId: schemaId.substring(schemaId.lastIndexOf(':') + 1, schemaId.length),
      type: 'CL',
      tag: credentialDefinitionRequest.tag,
      value: {
        primary: {},
      },
    }
    console.log(credDef)
    return credDef
  }
}

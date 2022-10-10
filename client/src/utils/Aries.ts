export enum CredentialEventTypes {
  CredentialStateChanged = 'CredentialStateChanged',
  RevocationNotificationReceived = 'RevocationNotificationReceived',
}

export enum ProofEventTypes {
  ProofStateChanged = 'ProofStateChanged',
}

export enum ConnectionEventTypes {
  ConnectionStateChanged = 'ConnectionStateChanged',
}

export interface CredentialExchangeRecord {
  _tags: string[]
  id: string
  createdAt: Date
  updatedAt?: Date
  state: string
  role: string
  metadata: { [key: string]: { credentialDefinitionId?: string } }
  connectionId: string
}

export interface ConnectionRecord {
  _tags: string[]
  id: string
  createdAt: Date
  updatedAt?: Date
  state: string
  role: string
  did?: string
  theirDid?: string
  theirLabel?: string
  alias?: string
  autoAcceptConnection?: boolean
  imageUrl?: string
  threadId?: string
  mediatorId?: string
  errorMessage?: string
  protocol?: string
  outOfBandId?: string
  invitationDid?: string
}

export interface ProofRecord {
  _tags: string[]
  id: string
  createdAt: Date
  updatedAt?: Date
  state: string
  connectionId: string
}

export interface ProofPredicateInfo {
  name: string
  predicateType: string
  predicateValue: number
  nonRevoked?: string
  restrictions?: string[]
}

export interface ProofAttribute {
  subProofIndex: number
  raw: string
  encoded: string
}

export interface ConnectionStateChangedEvent {
  type: typeof ConnectionEventTypes.ConnectionStateChanged
  payload: {
    connectionRecord: ConnectionRecord
    previousState: string | null
  }
}

export declare enum DidExchangeState {
  Start = 'start',
  InvitationSent = 'invitation-sent',
  InvitationReceived = 'invitation-received',
  RequestSent = 'request-sent',
  RequestReceived = 'request-received',
  ResponseSent = 'response-sent',
  ResponseReceived = 'response-received',
  Abandoned = 'abandoned',
  Completed = 'completed',
}

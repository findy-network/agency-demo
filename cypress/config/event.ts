import type { Event } from '../types/event'
import type { ConnectionStateChangedEvent } from '../../client/src/utils/Aries'

import { ConnectionEventTypes } from '../../client/src/utils/Aries'

export function isConnectionEvent(event: Event): event is ConnectionStateChangedEvent {
  return event.type === ConnectionEventTypes.ConnectionStateChanged
}

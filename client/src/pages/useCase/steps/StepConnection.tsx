import type { ConnectionState } from '../../../slices/connection/connectionSlice'
import type { Entity, Step } from '../../../slices/types'
import type { ConnectionRecord } from '../../../utils/Aries'

import { motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { useMediaQuery } from 'react-responsive'

import { fade, fadeX } from '../../../FramerAnimations'
import { useWebhookEvent } from '../../../api/Webhook'
import { QRCode } from '../../../components/QRCode'
import { useAppDispatch } from '../../../hooks/hooks'
import { useConnection } from '../../../slices/connection/connectionSelectors'
import { setConnection } from '../../../slices/connection/connectionSlice'
import { createInvitation } from '../../../slices/connection/connectionThunks'
import { useWallets } from '../../../slices/wallets/walletsSelectors'
import { ConnectionEventTypes } from '../../../utils/Aries'
import { StepInfo } from '../components/StepInfo'

export interface Props {
  step: Step
  connection: ConnectionState
  entity: Entity
}

export const StepConnection: React.FC<Props> = ({ step, connection, entity }) => {
  const dispatch = useAppDispatch()
  const { id, state, invitationUrl, outOfBandId } = connection
  const isCompleted = state === 'response-sent' || state === 'completed'
  const { useLegacyInvitations } = useConnection()

  useEffect(() => {
    if (!isCompleted) {
      dispatch(createInvitation({ entity, useLegacyInvitations }))
    }
  }, [])

  useWebhookEvent(
    ConnectionEventTypes.ConnectionStateChanged,
    (event: { payload: { connectionRecord: ConnectionRecord } }) => {
      if (event.payload.connectionRecord.outOfBandId === outOfBandId || event.payload.connectionRecord.id === id) {
        dispatch(setConnection(event.payload.connectionRecord))
      }
    },
    !id || (!isCompleted && id ? true : false),
    [outOfBandId, id],
  )

  const renderQRCode = invitationUrl && <QRCode invitationUrl={invitationUrl} connectionState={state} />

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  const { wallets } = useWallets()
  const walletURL = wallets[0].url
  const deepLink = `${walletURL}/connect/${window.btoa(invitationUrl || '')}`

  const renderCTA = !isCompleted ? (
    <motion.div variants={fade} key="openWallet">
      <p>
        Scan the QR-code with your{' '}
        <a target="_blank" rel="noopener noreferrer" href={deepLink}>
          wallet {isMobile && 'or'}
        </a>
      </p>
      {isMobile && (
        <a target="_blank" rel="noopener noreferrer" href={deepLink} className="underline underline-offset-2 mt-2">
          open in wallet
          <FiExternalLink className="inline pb-1" />
        </a>
      )}
    </motion.div>
  ) : (
    <motion.div variants={fade} key="ctaCompleted">
      <p>Success! You can continue.</p>
    </motion.div>
  )

  return (
    <motion.div variants={fadeX} initial="hidden" animate="show" exit="exit" className="flex flex-col h-full">
      <StepInfo title={step.title} description={step.description} />
      {renderQRCode}
      <div className="flex flex-col my-4 text-center font-semibold">{renderCTA}</div>
    </motion.div>
  )
}

/* eslint-disable no-console */
import type { ConnectionRecord } from '../../../utils/Aries'
import type { Content } from '../../../utils/OnboardingUtils'

import { motion } from 'framer-motion'
import React, { useEffect } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { useMediaQuery } from 'react-responsive'

import { fade, fadeX } from '../../../FramerAnimations'
import { useWebhookEvent } from '../../../api/Webhook'
import { Loader } from '../../../components/Loader'
import { QRCode } from '../../../components/QRCode'
import { useAppDispatch } from '../../../hooks/hooks'
import { useConnection } from '../../../slices/connection/connectionSelectors'
import { setConnection } from '../../../slices/connection/connectionSlice'
import { createInvitation } from '../../../slices/connection/connectionThunks'
import { setOnboardingConnectionId } from '../../../slices/onboarding/onboardingSlice'
import { setConnectionDate } from '../../../slices/preferences/preferencesSlice'
import { useWallets } from '../../../slices/wallets/walletsSelectors'
import { ConnectionEventTypes } from '../../../utils/Aries'
import { StepInformation } from '../components/StepInformation'

export interface Props {
  content: Content
  outOfBandId?: string
  connectionId?: string
  invitationUrl?: string
  connectionState?: string
}

export const SetupConnection: React.FC<Props> = ({
  content,
  outOfBandId,
  connectionId,
  invitationUrl,
  connectionState,
}) => {
  const dispatch = useAppDispatch()
  const isCompleted = connectionState === 'response-sent' || connectionState === 'completed'
  const { useLegacyInvitations } = useConnection()

  useEffect(() => {
    if (!isCompleted) dispatch(createInvitation({ useLegacyInvitations }))
  }, [])

  useEffect(() => {
    if (connectionId) {
      dispatch(setOnboardingConnectionId(connectionId))
      const date = new Date()
      dispatch(setConnectionDate(date))
    }
  }, [connectionId])

  useWebhookEvent(
    ConnectionEventTypes.ConnectionStateChanged,
    (event: { payload: { connectionRecord: ConnectionRecord } }) => {
      if (
        event.payload.connectionRecord.outOfBandId === outOfBandId ||
        event.payload.connectionRecord.id === connectionId
      ) {
        dispatch(setConnection(event.payload.connectionRecord))
      }
    },
    !connectionId || (!isCompleted && connectionId ? true : false),
    [outOfBandId, connectionId],
  )

  const renderQRCode = invitationUrl ? (
    <QRCode invitationUrl={invitationUrl} connectionState={connectionState} />
  ) : (
    <div className="m-auto">
      <Loader />
    </div>
  )

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  const { wallets } = useWallets()
  const walletURL = wallets[0].url
  const deepLink = `${walletURL}/connect/${window.btoa(invitationUrl || '')}`

  const renderCTA = !isCompleted ? (
    <motion.div variants={fade} key="openWallet">
      <p>
        Scan the QR-code with your{' '}
        <a target="_blank" rel="noopener noreferrer" href={deepLink}>
          wallet {isMobile && 'or'}{' '}
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
    <motion.div
      className="flex flex-col h-full  dark:text-white"
      variants={fadeX}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <StepInformation title={content.title} text={content.text} />
      {renderQRCode}
      <div className="flex flex-col mt-4 text-center text-sm md:text-base font-semibold">{renderCTA}</div>
    </motion.div>
  )
}

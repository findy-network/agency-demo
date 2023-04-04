import QR from 'qrcode.react'
import React from 'react'
import { useMediaQuery } from 'react-responsive'

import { CheckMark } from './Checkmark'

export interface Props {
  invitationUrl: string
  connectionState?: string
}

export const QRCode: React.FC<Props> = ({ invitationUrl, connectionState }) => {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  const isLarge = useMediaQuery({ query: '(max-width: 1242px)' })

  const isCompleted = connectionState === 'responded' || connectionState === 'completed'

  const renderQRCode = invitationUrl && (
    <div data-cy="qr-code" title={invitationUrl} className="relative m-auto rounded-lg bg-animo-lightgrey p-4">
      <QR value={invitationUrl} size={isMobile ? 192 : isLarge ? 212 : 256} />
      {isCompleted && (
        <div className="absolute inset-0 flex justify-center items-center bg-grey bg-opacity-60 rounded-lg">
          <CheckMark height="64" colorCircle="grey" />
        </div>
      )}
    </div>
  )

  return <div className="m-auto shadow-lg rounded-lg">{renderQRCode}</div>
}

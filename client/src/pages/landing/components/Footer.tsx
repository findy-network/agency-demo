import React from 'react'

import animoDark from '../../../assets/dark/animo-logo-dark.png'
import animoLight from '../../../assets/light/animo-logo-light.png'
import { useDarkMode } from '../../../hooks/useDarkMode'

export const Footer: React.FC = () => {
  const darkMode = useDarkMode()

  return (
    <div>
      <div className="flex dark:text-white justify-center content-center select-none my-8 pb-4 sm:my-4">
        <p className="self-center mr-2 text-sm">UX and original app implementation:</p>
        <a href="https://animo.id" target="_blank">
          <img className="m-2 h-3" src={darkMode ? animoDark : animoLight} alt="animo-credentials-home" />
        </a>
      </div>
      <div className="flex dark:text-white justify-center content-center select-none my-8 pb-4 sm:my-4">
        <p className="self-center mr-2 text-sm">POWERED BY</p>
        <p className="self-center mr-2 text-sm">
          <a href="https://findy-network.github.io" target="_blank">
            FINDY AGENCY
          </a>
          {` and `}
          <a href="https://www.op-lab.fi" target="_blank">
            OP LAB
          </a>
        </p>
      </div>
    </div>
  )
}

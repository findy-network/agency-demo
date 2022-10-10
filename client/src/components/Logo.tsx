import React from 'react'

import { useDarkMode } from '../hooks/useDarkMode'

export const Logo: React.FC = () => {
  const darkMode = useDarkMode()

  return (
    <div className="flex-1-1 m-auto">
      <a href="/">
        <p className="self-center mr-2 text-xl">DEMO</p>
      </a>
    </div>
  )
}

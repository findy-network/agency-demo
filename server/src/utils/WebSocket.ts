import WebSocket from 'ws'

import logger from './logger'

export const sendWebSocketEvent = async (server: WebSocket.Server, data: unknown) => {
  const strData = typeof data === 'string' ? data : JSON.stringify(data)
  logger.debug(`Sending data ${strData} to ${server.clients.values.length} socket clients `)
  // TODO: client register with client specific events
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(strData)
    }
  })
}

export const createSocketServer = () => {
  const socketServer = new WebSocket.Server({ noServer: true, path: '/ws' })

  setInterval(() => {
    socketServer.clients.forEach((client) => {
      client.ping(() => {
        logger.debug('ws pinged')
      })
    })
  }, 30000)
  return socketServer
}

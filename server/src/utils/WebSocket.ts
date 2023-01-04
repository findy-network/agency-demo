import WebSocket from 'ws'

import logger from './logger'

export const sendWebSocketEvent = async (server: WebSocket.Server, data: unknown) => {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      typeof data === 'string' ? client.send(data) : client.send(JSON.stringify(data))
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

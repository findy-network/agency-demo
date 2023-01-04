import WebSocket from 'ws'

interface ExtWebSocket extends WebSocket {
  isAlive: boolean
}

export const sendWebSocketEvent = async (server: WebSocket.Server, data: unknown) => {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      typeof data === 'string' ? client.send(data) : client.send(JSON.stringify(data))
    }
  })
}

export const createSocketServer = () => {
  const socketServer = new WebSocket.Server({ noServer: true, path: '/ws' })

  const heartbeat = (ws: ExtWebSocket) => {
    ws.isAlive = true
  }
  const ping = (ws: ExtWebSocket) => {}

  socketServer.on('connection', (socket: ExtWebSocket) => {
    socket.isAlive = true
    socket.on('pong', () => {
      heartbeat(socket)
    })
  })

  setInterval(() => {
    socketServer.clients.forEach((client) => {
      const ws = client as ExtWebSocket
      if (ws.isAlive === false) {
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping(() => {
        ping(ws)
      })
    })
  }, 30000)
  return socketServer
}

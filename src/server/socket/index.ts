import type { Server as SocketServer, Socket } from 'socket.io'

export default (event : any, io : SocketServer) => {
  io.on('connection', (socket : Socket) => {

  })

  global.IO = io
}
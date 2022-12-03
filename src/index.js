// Copyright (C) 2022 Adam K Dean <adamkdean@googlemail.com>
// Use of this source code is governed by the GPL-3.0
// license that can be found in the LICENSE file.

const WebSocket = require('ws')

const port = process.env.PORT || 8080
const server = new WebSocket.Server({ port })

let sessionActive = false
let connections = {}

server.on('listening', () => {
  console.log(`Listening for connections on port ${port}`)
})

server.on('connection', (socket, req) => {
  const searchParams = new URLSearchParams(req.url.slice(1))
  const username = searchParams.get('username')

  // Ensure username is provided
  if (!username) {
    console.log('No username provided', username)
    socket.terminate()
    return
  }

  // Ensure two connections are connected at most
  if (Object.keys(connections).length >= 2) {
    console.log('Too many connections', connections.length)
    socket.send('SERVER_BUSY')
    socket.terminate()
    return
  }

  // Ensure username is unique
  if (connections[username]) {
    console.log('Username already exists', username)
    socket.send('USERNAME_BUSY')
    socket.terminate()
    return
  }

  console.log('New connection from user:', username)
  connections[username] = socket

  // Send session active message to new connection
  const otherUser = Object.keys(connections).find((user) => user !== username)
  if (otherUser) {
    console.log('Sending offer to', otherUser)
    connections[otherUser].send('SESSION_ACTIVE')
    socket.send('SESSION_ACTIVE')
    sessionActive = true
  } else {
    socket.send('SESSION_PENDING')
  }

  socket.on('message', (message) => {
    console.log(`Received message: ${message}`)
  })

  socket.on('close', () => {
    delete connections[username]
    console.log(`User ${username} disconnected`)
    if (sessionActive) {
      // terminate all sockets
      Object.keys(connections).forEach((user) => {
        connections[user].send('SESSION_TERMINATED')
        connections[user].terminate()
      })
      connections = {}
      console.log('Session ended')
      sessionActive = false
    }
  })
})

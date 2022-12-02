// Copyright (C) 2022 Adam K Dean <adamkdean@googlemail.com>
// Use of this source code is governed by the GPL-3.0
// license that can be found in the LICENSE file.

const WebSocket = require('ws')

const port = process.env.PORT || 8080
const server = new WebSocket.Server({ port })

server.on('listening', () => {
  console.log(`Listening for connections on port ${port}`)
})

server.on('connection', (socket, req) => {
  const searchParams = new URLSearchParams(req.url.slice(1))
  console.log(searchParams)
  const username = searchParams.get('username')
  if (!username) {
    console.log('No username provided', username)
    socket.terminate()
    return
  }

  console.log('New connection from', username)

  socket.on('message', (message) => {
    console.log(`Received message: ${message}`)
  })

  socket.on('close', () => {
    console.log('Connection closed')
  })
})

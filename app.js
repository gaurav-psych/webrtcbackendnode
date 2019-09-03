const express = require('express');
const app = express();
const fs = require('fs');
const open = require('open');
const options = {
  key: fs.readFileSync('./fake-keys/privatekey.pem'),
  cert: fs.readFileSync('./fake-keys/certificate.pem'),
};
const serverPort = (process.env.PORT || 4443);
const https = require('https');
const http = require('http');
let server;
if (process.env.LOCAL) {
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}
const io = require('socket.io')(server);
const calling = io.of('/calling');
/* ==============================
 Middleware
 ================================ */
app.use(express.static(__dirname + '/public'));
app.get('/', getCallback);
io.on('connection', ioCallback);
calling.on('connection', callingCallback);
server.listen(serverPort, listenCallback);

/* ==============================
 Middleware Functions
 ================================ */
function getCallback(req, res) {
  console.log('get /');
  res.sendFile(__dirname + '/index.html');
}

function listenCallback() {
  console.log('server up and running at %s port', serverPort);
  if (process.env.LOCAL) {
    open('https://localhost:' + serverPort);
  }
}

function ioCallback(socket) {
  console.log(`Socket id: ${socket.id}`);

  socket.on('join', (roomID, callback) => {
    console.log('join', roomID);
    let socketIds = socketIdsInRoom(roomID);
    console.log(socketIds);
    callback(socketIds);
    socket.join(roomID);
    socket.room = roomID;
  });

  socket.on('exchange', data => {
    console.log('exchange', data.to);

    data.from = socket.id;
    let to = io.sockets.connected[data.to];
    to.emit('exchange', data);
  });
  socket.on('declineCalling', roomID => {
    console.log('disconnect');

    socketIdsInRoom(roomID).forEach(socketId => {
      console.log('current socketId:',socketId);
      console.log('io.sockets.connected',io.sockets.connected);
      io.sockets.connected[socketId].close();
      io.sockets.connected[socketId].emit('leave');
    })
  });

  socket.on('disconnect', () => {
    console.log('disconnect');
    if (socket.room) {
      let room = socket.room;
      io.to(room).emit('leave', socket.id);
      socket.leave(room);
    }
  });
}
function callingCallback(socket) {
  console.log(`calling Socket id: ${socket.id}`);

  socket.on('join', (roomID) => {
    let socketIds = socketIdsInRoom(roomID);
    console.log('calling join',socketIds);
    socket.join(roomID);
    socket.room = roomID;
  });

  socket.on('hangOff', roomID => {
    console.log('hangOff');
    socketIdsInRoom(roomID).forEach(socketId => {
      io.sockets.connected[socketId].emit('closeModal');
    })
  });
}

/* ==============================
 Socket Functions
 ================================ */
function socketIdsInRoom(roomID) {
  let socketIds = io.nsps['/'].adapter.rooms[roomID];

  if (socketIds) {
    let collection = [];
    for (let key in socketIds) {
      collection.push(key);
    }
    return collection;
  } else {
    return [];
  }
}

export const ServerTemplate = `
const { Server } = require('socket.io');
const http = require('http');

function createGameServer(httpServer, options = {}) {
  const io = new Server(httpServer, {
    cors: {
      origin: options.corsOrigin || '*',
      methods: ['GET', 'POST']
    }
  });

  const rooms = new Map();
  const players = new Map();

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    players.set(socket.id, {
      id: socket.id,
      roomId: null,
      data: {}
    });

    socket.on('ping', () => {
      socket.emit('pong', Date.now());
    });

    socket.on('createRoom', (data, callback) => {
      const { roomId, playerData, maxPlayers } = data;
      
      if (rooms.has(roomId)) {
        callback({ error: 'Room already exists' });
        return;
      }
      
      const room = {
        id: roomId,
        hostId: socket.id,
        players: new Map(),
        maxPlayers: maxPlayers || 8,
        settings: {},
        gameState: 'lobby'
      };
      
      room.players.set(socket.id, {
        id: socket.id,
        ready: false,
        ...playerData
      });
      
      rooms.set(roomId, room);
      players.get(socket.id).roomId = roomId;
      socket.join(roomId);
      
      callback({
        success: true,
        roomId,
        hostId: socket.id
      });
    });

    socket.on('joinRoom', (data, callback) => {
      const { roomId, playerData } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        callback({ error: 'Room not found' });
        return;
      }
      
      if (room.players.size >= room.maxPlayers) {
        callback({ error: 'Room is full' });
        return;
      }
      
      const player = {
        id: socket.id,
        ready: false,
        ...playerData
      };
      
      room.players.set(socket.id, player);
      players.get(socket.id).roomId = roomId;
      socket.join(roomId);
      
      socket.to(roomId).emit('playerJoined', { player });
      
      callback({
        success: true,
        roomId,
        hostId: room.hostId,
        players: Array.from(room.players.values()),
        settings: room.settings,
        gameState: room.gameState
      });
    });

    socket.on('leaveRoom', (data) => {
      handlePlayerLeaveRoom(socket, data.roomId);
    });

    socket.on('setReady', (data) => {
      const room = rooms.get(data.roomId);
      if (room && room.players.has(socket.id)) {
        room.players.get(socket.id).ready = true;
        io.to(data.roomId).emit('playerReady', { playerId: socket.id });
      }
    });

    socket.on('setNotReady', (data) => {
      const room = rooms.get(data.roomId);
      if (room && room.players.has(socket.id)) {
        room.players.get(socket.id).ready = false;
        io.to(data.roomId).emit('playerNotReady', { playerId: socket.id });
      }
    });

    socket.on('updateSettings', (data) => {
      const room = rooms.get(data.roomId);
      if (room && room.hostId === socket.id) {
        room.settings = { ...room.settings, ...data.settings };
        io.to(data.roomId).emit('lobbySettings', { settings: room.settings });
      }
    });

    socket.on('startGame', (data) => {
      const room = rooms.get(data.roomId);
      if (room && room.hostId === socket.id) {
        room.gameState = 'playing';
        io.to(data.roomId).emit('gameStarting', {
          settings: room.settings,
          players: Array.from(room.players.values())
        });
      }
    });

    socket.on('kickPlayer', (data) => {
      const room = rooms.get(data.roomId);
      if (room && room.hostId === socket.id) {
        const kickedSocket = io.sockets.sockets.get(data.playerId);
        if (kickedSocket) {
          kickedSocket.emit('kicked');
          handlePlayerLeaveRoom(kickedSocket, data.roomId);
        }
      }
    });

    socket.on('chatMessage', (data) => {
      io.to(data.roomId).emit('chatMessage', {
        playerId: socket.id,
        message: data.message,
        timestamp: Date.now()
      });
    });

    socket.on('stateUpdate', (data) => {
      const player = players.get(socket.id);
      if (player && player.roomId) {
        socket.to(player.roomId).emit('stateUpdate', {
          ...data,
          playerId: socket.id
        });
      }
    });

    socket.on('broadcast', (data) => {
      const player = players.get(socket.id);
      if (player && player.roomId) {
        const target = data.includeSelf ? io.to(player.roomId) : socket.to(player.roomId);
        target.emit(data.event, data.data);
      }
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      const player = players.get(socket.id);
      
      if (player && player.roomId) {
        handlePlayerLeaveRoom(socket, player.roomId);
      }
      
      players.delete(socket.id);
    });
  });

  function handlePlayerLeaveRoom(socket, roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.players.delete(socket.id);
    socket.leave(roomId);
    
    if (players.has(socket.id)) {
      players.get(socket.id).roomId = null;
    }
    
    io.to(roomId).emit('playerLeft', { playerId: socket.id });
    
    if (room.players.size === 0) {
      rooms.delete(roomId);
      console.log('Room deleted:', roomId);
    } else if (room.hostId === socket.id) {
      const newHost = room.players.keys().next().value;
      room.hostId = newHost;
      io.to(roomId).emit('hostChanged', { newHostId: newHost });
    }
  }

  return io;
}

module.exports = { createGameServer };
`;

export function getServerTemplate() {
  return ServerTemplate;
}

export const ExpressServerTemplate = `
const express = require('express');
const http = require('http');
const { createGameServer } = require('./gameServer');

const app = express();
const server = http.createServer(app);
const io = createGameServer(server);

app.use(express.static('public'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/rooms', (req, res) => {
  const roomList = [];
  for (const [id, room] of io.rooms || new Map()) {
    roomList.push({
      id,
      playerCount: room.players?.size || 0,
      maxPlayers: room.maxPlayers || 8,
      gameState: room.gameState || 'lobby'
    });
  }
  res.json({ rooms: roomList });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(\`Game server running on port \${PORT}\`);
});
`;

export function getExpressServerTemplate() {
  return ExpressServerTemplate;
}

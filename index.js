const express = require("express");
const socket = require("socket.io");
const utils = require("./utils");

const state = {};
const clientRooms = {};

const app = express();
const server = app.listen(process.env.PORT || 4000);

// Middleware
app.use(express.static("public"));

// Socket setup
const io = socket(server);
io.on("connection", client => {
  client.on("move", handleMove);
  client.on("notation", handleNotation);
  client.on("winner", handleWinner);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
  client.on("chat", handleChat);
  client.on("disconnect", handleDisconnect);

  function handleMove({html, capture}) {
    let roomName = clientRooms[client.id];
    state[roomName] = html;
    client.to(roomName).emit("move", {html: state[roomName], capture: capture});
    io.emit("adminDashboardMove", {state: state[roomName], roomName: roomName});
  }

  function handleNotation({from, to}) {
    let roomName = clientRooms[client.id];
    io.sockets.to(roomName).emit("notation", `${from}-${to}`);
  }

  function handleWinner({winner, cause}) {
    let roomName = clientRooms[client.id];
    io.sockets.in(roomName).emit("gameOver", {winner, cause});
  }
  
  function handleNewGame() {
    let roomName = utils.makeID(5);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);
    state[roomName] = utils.gameState();
    client.join(roomName);
    client.number = 1;
    client.emit("init", {html: utils.gameState(), number: 1});
  }

  function handleJoinGame(roomName) {
    client.emit("gameCode", roomName);
    const room = io.sockets.adapter.rooms.get(roomName);

    let numClients = 0;
    if (room) {
      numClients = room.size;
    }

    if (numClients === 0) {
      client.emit("unknownGame");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms[client.id] = roomName;
    client.join(roomName);
    client.number = 2;
    client.emit("init", {html: state[roomName], number: 2});
    io.sockets.to(roomName).emit("joined");
    io.emit("adminDashboardInit", {state: state[roomName], roomName: roomName});
  }

  function handleChat({msg, nr}) {
    let roomName = clientRooms[client.id];
    io.sockets.to(roomName).emit("chat", {msg, nr});
  }

  function handleDisconnect() {
    let roomName = clientRooms[client.id];
    io.sockets.to(roomName).emit("left");
    io.emit("adminDashboardLeave", roomName);
  }
});


// Admin route
app.get("/admin", (req, res) => {
  res.sendFile("/public/admin.html", {root: __dirname });
});
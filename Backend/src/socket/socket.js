const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });
};

const getIO = () => io;

module.exports = { initSocket, getIO };
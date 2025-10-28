const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const PORT = 3000;
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*", // allow all for testing
    methods: ["GET", "POST"],
  },
});

app.use(cors());

// Store all connected users
const locations = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send existing users to new user
  const existingUsers = {};
  for (let [id, data] of Object.entries(locations)) {
    existingUsers[id] = {
      lat: data.lat,
      lng: data.lng,
      name: data.name || "Anonymous",
    };
  }
  socket.emit("init", existingUsers);

  // Receive location updates
  socket.on("location", (data) => {
    locations[socket.id] = {
      lat: data.lat,
      lng: data.lng,
      name: data.name,
      timestamp: Date.now(),
    };
    socket.broadcast.emit("userMoved", {
      id: socket.id,
      lat: data.lat,
      lng: data.lng,
      name: data.name,
    });
  });

  socket.on("disconnect", () => {
    delete locations[socket.id];
    socket.broadcast.emit("userLeft", socket.id);
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const locations = {};

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.emit("init", { ...locations });

  socket.on("location", (data) => {
    locations[socket.id] = {
      lat: data.lat,
      lng: data.lng,
      timestamp: Date.now(),
    };
    socket.broadcast.emit("userMoved", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    delete locations[socket.id];
    socket.broadcast.emit("userLeft", socket.id);
    console.log("❌ User disconnected:", socket.id);
  });
});

// Simple route to test server
app.get("/", (req, res) => {
  res.send("Server is running!");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

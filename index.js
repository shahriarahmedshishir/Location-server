const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "../client/build")));

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

// ✅ FIXED: Express v5 wildcard route syntax
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

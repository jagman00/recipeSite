const express = require('express');
const app = express();
const cors = require('cors');
const { createServer } = require('http'); // For integrating Socket.IO
const { Server } = require('socket.io'); // Importing Socket.io 


require('dotenv').config(); //please put your PORT in .env file
app.use(express.json());
app.use(require('morgan')('dev'));
app.use(cors());

// Serve static files from the "uploads" folder
app.use("/uploads", express.static("uploads"));

// Health Check Endpoint
let errorLogs = []; // Store logs globally 

app.get("/api/health", (req, res) => {
  const hasErrors = errorLogs.length > 0;
  res.status(200).json({
    status: hasErrors ? "issues" : "ok",
    logs: errorLogs,
  });
});

// Log errors
app.use((err, req, res, next) => {
  errorLogs.push(err.message);
  res.status(500).json({ message: "Internal server error" });
});

// Create an HTTP server for Socket.IO
const httpServer = createServer(app);
// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Manage user connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add user to a specific room based on their user ID
  socket.on("join", (userId)=> {
    if (!userId) {
      console.error(`userId not provided for socket.join: ${userId}`);
      return;
    }
    socket.join(`user-${userId}`); // Use a unique room name for each user
    console.log(`User ${userId} joined their rooms.`);
  })

  socket.on("leave", (userId) => {
    socket.leave(`user-${userId}`);
    console.log(`User ${userId} left their rooms.`);
  });

  // Handle - unintended user disconnection (automatic)
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
}); 

// Pass io instance dynamically to routes
app.use((req, res, next) => {
  req.io = io; // Add Socket.IO to the request object
  next();
});

// Mount the API router at /api
app.use("/api", require("./api/router"));

app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status ?? 500;
    const message = err.message ?? 'Internal server error.';
    res.status(status).json({ message });
  });
  
// Start the server  
httpServer.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

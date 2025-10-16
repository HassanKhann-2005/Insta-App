import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js"
import { fileURLToPath } from 'url';
import path from 'path';
import profilepicRoutes from "./routes/profilepicRoutes.js"
import postsRoutes from "./routes/postsRoutes.js"
import storiesRoutes from "./routes/storiesRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js";
import { Server } from "socket.io";
import { createServer } from "http";
import messageRoutes from "./routes/messageRoutes.js";
import e from "express-status-monitor";


dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", // explicitly allow your frontend
    "http://192.168.1.23:5173" // replace with your Mac’s local IP
],
  credentials: true, 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // replaces bodyParser.json()
app.use(e());

//Routes
app.use("/api/users",userRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/profile", profilepicRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/stories",storiesRoutes);
app.use("/api/notifications",notificationRoutes);
app.use("/api/messages",messageRoutes);

// PORT
const PORT = process.env.PORT || 5000;

//MongoDB connection
const MONGO_URL = process.env.MONGO_URI

// For serving frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // For React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Create HTTP server

const server = createServer(app);

// webSocket connection
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // explicitly allow your frontend
      "http://192.168.1.23:5173" // replace with your Mac’s local IP
  ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // 👈 add this
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("sendMessage", (data) => {
    // Forward message to recipient
    io.to(data.receiverId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

mongoose.connect(MONGO_URL).then(()=>{
    console.log("Database connected successfully");
}).catch((err)=>{
    console.log("Database connection failed", err);
})

server.listen(PORT,"0.0.0.0",()=>{
    console.log(`Server is running on port ${PORT}`);
})
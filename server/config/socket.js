import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL], 
      methods: ["GET", "POST", "PATCH", "PUT"],
      credentials: true 
    },
    transports: ["websocket", "polling"] 
  });

  // ✅ FIXED: Middleware must be defined AFTER 'io' is initialized
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
       console.log("❌ Socket Auth Failed: No token");
       return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; 
      next();
    } catch (err) {
      console.log("❌ Socket Auth Failed: Invalid Token");
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("⚡ New Connection established:", socket.id);

    socket.on("join_hospital", (hospitalId) => {
      if (!hospitalId) {
        console.log("⚠️ Join failed: No hospitalId provided");
        return;
      }
      
      const roomId = String(hospitalId);
      socket.join(roomId);
      console.log(`📡 Hospital ${roomId} joined their secure room.`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 User disconnected: ${reason}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
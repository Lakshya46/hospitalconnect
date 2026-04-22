import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import http from "http"; // 1. Import HTTP
import { initSocket } from "./config/socket.js"; // Your socket config

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

const app = express();
const server = http.createServer(app); // 2. Create the HTTP server wrapper



// ✅ CORS
app.use(cors({
  origin: [ process.env.CLIENT_URL],
 methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  credentials: true
}));



app.use(express.json());

// 3. Initialize Socket.io with the server wrapper
initSocket(server);

// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ✅ ROUTES
import authRoutes from "./routes/authRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bloodRoutes from "./routes/bloodRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";

app.use("/api/doctors", doctorRoutes);
app.use("/api/blood", bloodRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/appointment", appointmentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/patient", patientRoutes);

// ✅ DB CONNECT
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI missing in .env");
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  });

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    msg: "Something went wrong",
    error: err.message
  });
});

// ✅ SERVER START
const PORT = process.env.PORT || 5000;

// 4. 🔥 CRITICAL: Listen using 'server', NOT 'app'
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
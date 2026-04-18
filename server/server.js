import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();

// ✅ CORS
app.use(cors({
  origin: ["http://localhost:5173", process.env.CLIENT_URL],
  credentials: true
}));

app.use(express.json());

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
app.use("/api/requests", requestRoutes); // For resource requests
app.use("/api/notifications", notificationRoutes); // For notifications
app.use("/api/patient", patientRoutes);
// ✅ ENV CHECK

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI missing in .env");
}

// ✅ DB CONNECT
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
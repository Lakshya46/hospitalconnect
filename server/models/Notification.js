import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // 🔥 ADD THIS FIELD HERE
  senderHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  },
  type: {
    type: String,
    enum: ["urgent", "appointment", "system"],
    default: "urgent"
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // ACTIONABLE FIELDS
  isActionable: { type: Boolean, default: false },
  requestId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ResourceRequest" 
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending"
  },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
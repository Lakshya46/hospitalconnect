// models/ResourceRequest.js
import mongoose from "mongoose";

const resourceRequestSchema = new mongoose.Schema({
  senderHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  receiverHospitalId: {
    type: mongoose.Schema.Types.ObjectId, // Null if it's a broadcast
    ref: "Hospital",
    default: null
  },
  // 🔥 Support for multiple items in one request
  items: [{
    category: { type: String, enum: ["Supplies", "Blood", "Doctor"] },
    type: { type: String, required: true },
    quantity: { type: Number, default: 1 }
  }],
  urgency: {
    type: String,
    enum: ["Medium", "High", "Critical"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Fulfilled"],
    default: "Pending"
  },
  isBroadcast: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("ResourceRequest", resourceRequestSchema);
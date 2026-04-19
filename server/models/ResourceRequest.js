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
    category: { 
      type: String, 
      enum: ["Supplies", "Blood", "Doctor"],
      required: true 
    },
    type: { type: String, required: true },
    quantity: { type: Number, default: 1 }
  }],
  urgency: {
    type: String,
    // 🔥 Added "Low" to match the frontend selection
    enum: ["Low", "Medium", "High", "Critical"], 
    default: "Medium"
  },
  status: {
    type: String,
    // 🔥 Added "Cancelled" to support the Withdraw functionality
    enum: ["Pending", "Accepted", "Rejected", "Fulfilled", "Cancelled"], 
    default: "Pending"
  },
  isBroadcast: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

// Indexing for faster status-board queries
resourceRequestSchema.index({ senderHospitalId: 1, status: 1 });

export default mongoose.model("ResourceRequest", resourceRequestSchema);
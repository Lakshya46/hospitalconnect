import mongoose from "mongoose";

const resourceRequestSchema = new mongoose.Schema({

  
  senderHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  receiverHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  },

  type: {
    type: String,
    enum: ["Blood", "Oxygen", "Bed", "ICU", "Medicine", "Ambulance"],
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  urgency: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium"
  },

  description: String,

  status: {
    type: String,
    enum: ["Pending", "Approved", "Fulfilled", "Rejected"],
    default: "Pending"
  }

}, { timestamps: true });

export default mongoose.model("ResourceRequest", resourceRequestSchema);
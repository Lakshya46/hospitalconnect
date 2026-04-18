import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["patient", "hospital", "admin"],
    required: true
  },
  
  /* 🏥 NEW MEDICAL & PROFILE FIELDS */
  profilePic: {
    type: String,
    default: "" // Stores the URL or file path
  },
  age: {
    type: Number,
    default: null
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: ""
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  history: {
    type: [String], // Array of strings for medical records
    default: []
  },

  /* NOTIFICATIONS & SYSTEM */
  pushSubscription: {
    type: Object,
    default: null
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
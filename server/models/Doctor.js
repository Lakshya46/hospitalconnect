import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  /* 🔗 LINK WITH HOSPITAL */
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  /* 👨‍⚕️ BASIC INFO */
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  specialization: { 
    type: String, 
    required: true 
  },
  experience: { 
    type: Number, 
    required: true,
    default: 0 
  },
  education: { 
    type: String, 
    required: true 
  },
  contact: { 
    type: String 
  },
  email: { 
    type: String,
    lowercase: true
  },

  /* 🕒 WEEKLY SCHEDULE (NEW) */
  // This allows different timings for different days
  schedule: [
    {
      day: { 
        type: String, 
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
      },
      startTime: { 
        type: String, // Store as "HH:mm" (e.g., "09:00")
        default: "09:00" 
      },
      endTime: { 
        type: String, // Store as "HH:mm" (e.g., "17:00")
        default: "17:00" 
      },
      isAvailable: { 
        type: Boolean, 
        default: true 
      }
    }
  ],

  /* 🟢 STATUS & PROFILE */
  availability: {
    type: String, 
    enum: ["Available", "On Leave", "In Surgery", "Busy"],
    default: "Available",
  },
  image: { 
    type: String, 
    default: "https://via.placeholder.com/150" 
  },

}, { timestamps: true });

// Index for faster lookups when filtering by hospital
doctorSchema.index({ hospitalId: 1 });

export default mongoose.model("Doctor", doctorSchema);
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
    required: true,
    enum: [
      "General Physician", "Cardiologist", "Oncologist", "Pediatrician", 
      "Gynecologist", "Orthopedic Surgeon", "Neurologist", "Ophthalmologist", 
      "ENT Specialist", "Dentist", "Psychiatrist", "Emergency Specialist", 
      "Ayurvedic Doctor", "Radiologist", "Physiotherapist"
    ]
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

  /* 📞 CONTACT DETAILS (Matched with Frontend) */
  contact: { 
    type: String,
    required: true // Usually mandatory for hospital coordination
  },
  email: { 
    type: String,
    lowercase: true,
    trim: true,
    // Optional: match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },

  /* 🕒 WEEKLY SCHEDULE */
  schedule: [
    {
      day: { 
        type: String, 
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
      },
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "17:00" },
      isAvailable: { type: Boolean, default: true }
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

// Optimize search by hospital and specialization
doctorSchema.index({ hospitalId: 1, specialization: 1 });

export default mongoose.model("Doctor", doctorSchema);
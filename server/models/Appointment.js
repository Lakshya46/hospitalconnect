import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({

  /* 👤 PATIENT */
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  /* 🏥 HOSPITAL */
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  /* 👨‍⚕️ DOCTOR */
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  /* 📅 SCHEDULE */
  date: {
    type: String,
    required: true
  },

  time: {
    type: String,
    required: true
  },

  /* 📌 STATUS */
  status: {
    type: String,
    enum: ["Pending", "Approved", "Completed", "Rejected", "Cancelled"],
    default: "Pending"
  },

  /* 📝 NOTES */
  reason: String,          // why patient booked
  prescription: String,    // doctor adds later

  /* 🔁 RESCHEDULE */
  rescheduled: {
    type: Boolean,
    default: false
  },

  /* 💰 PAYMENT (future use) */
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid"],
    default: "Pending"
  }

}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
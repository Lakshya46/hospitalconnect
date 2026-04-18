import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// @desc    Get aggregated stats for Patient Dashboard
// @route   GET /api/patient/dashboard
// @access  Private (Patient Only)
export const getPatientDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const user = await User.findById(userId).select("name history");

    // 1. MATCH THE STATUS: Use "Pending" or "Approved" to match your Model
    const upcomingCount = await Appointment.countDocuments({
      patientId: userId,
      status: { $in: ["Pending", "Approved"] }, 
      date: { $gte: today } 
    });

    const totalVisits = await Appointment.countDocuments({
      patientId: userId,
      status: "Completed" // Must be capitalized to match Model
    });

    // 2. POPULATE DOCTOR: You need to populate doctorId to get the name
    const nextAppointment = await Appointment.findOne({
      patientId: userId,
      status: { $in: ["Pending", "Approved"] },
      date: { $gte: today }
    })
    .sort({ date: 1, time: 1 })
    .populate("hospitalId", "name location")
    .populate("doctorId", "name specialization"); // 🔥 Added this

    res.status(200).json({
      user,
      stats: {
        upcomingCount,
        totalVisits,
        reportsCount: user.history ? user.history.length : 0
      },
      nextAppointment
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// @desc    Get all appointments for a patient
// @route   GET /api/patient/appointments
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .sort({ date: -1 })
      .populate("hospitalId", "name location contact");
    
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};
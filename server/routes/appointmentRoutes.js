import express from "express";
import Appointment from "../models/Appointment.js";
import Hospital from "../models/Hospital.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- 1. PATIENT: GET MY APPOINTMENTS (FOR THE REDESIGNED UI) ---
router.get(
  "/patient-appointments",
  authMiddleware,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      // Find appointments where patientId matches the logged-in user
      const appointments = await Appointment.find({ patientId: req.user.id })
        .populate("hospitalId", "name address logo") // Populate hospital details
        .populate("doctorId", "name specialization image") // Populate doctor details
        .sort({ date: -1 }); // Show most recent first

      res.json(appointments);
    } catch (err) {
      console.error("Fetch Patient Apps Error:", err);
      res.status(500).json({ msg: "Failed to fetch appointments", error: err.message });
    }
  }
);

// --- 2. PATIENT: BOOK APPOINTMENT ---
// routes/appointmentRoutes.js

router.post("/book", authMiddleware, authorizeRoles("patient"), async (req, res) => {
  try {
    const { hospitalId, doctorId, date, time, reason } = req.body;

    const newAppointment = new Appointment({
      patientId: req.user.id,
      hospitalId,
      doctorId,
      date,
      time,
      reason,
      status: "Pending" // 🔥 CHANGED: Must match your existing schema enum
    });

    const savedApp = await newAppointment.save();
    res.status(201).json({ msg: "Appointment requested!", appointment: savedApp });
  } catch (err) {
    res.status(500).json({ msg: "Booking failed", error: err.message });
  }
});

// --- 3. HOSPITAL: MANAGE APPOINTMENTS ---
router.get(
  "/hospital-list",
  authMiddleware,
  authorizeRoles("hospital"),
  async (req, res) => {
    try {
      // Find the Hospital document linked to the logged-in User
      const hospitalProfile = await Hospital.findOne({ userId: req.user.id });

      if (!hospitalProfile) {
        return res.status(404).json({ msg: "Hospital profile not found" });
      }

      const list = await Appointment.find({ hospitalId: hospitalProfile._id })
        .populate("patientId", "name phone email")
        .populate("doctorId", "name specialization") 
        .sort({ date: 1, time: 1 });

      res.json(list);
    } catch (err) {
      console.error("Fetch Hospital Apps Error:", err);
      res.status(500).json({ msg: "Fetch failed", error: err.message });
    }
  }
);

// --- 4. HOSPITAL: UPDATE APPOINTMENT STATUS ---
router.patch(
  "/update-status/:id",
  authMiddleware,
  authorizeRoles("hospital"),
  async (req, res) => {
    try {
      const { status } = req.body; // e.g., "Upcoming", "Rescheduled", "Completed", "Cancelled"

      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!appointment) return res.status(404).json({ msg: "Appointment not found" });

      res.json({ msg: `Appointment status updated to ${status}`, appointment });
    } catch (err) {
      res.status(500).json({ msg: "Update failed", error: err.message });
    }
  }
);

// --- HOSPITAL/PATIENT: RESCHEDULE APPOINTMENT ---
// This route is shared or can be specific to roles
router.patch(
  "/reschedule/:id",
  authMiddleware,
  // We allow both roles to reschedule, but you can restrict as needed
  authorizeRoles("hospital", "patient"), 
  async (req, res) => {
    try {
      const { date, time } = req.body;

      // 1. Basic validation
      if (!date || !time) {
        return res.status(400).json({ msg: "New date and time are required" });
      }

      // 2. Find and Update
      // We set rescheduled: true so the UI can show the "Rescheduled" badge
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { 
          date, 
          time, 
          rescheduled: true,
          status: "Pending" // Reset to Pending so it's clear it's a new proposal
        },
        { new: true } // Return the updated document
      );

      if (!updatedAppointment) {
        return res.status(404).json({ msg: "Appointment not found" });
      }

      res.json({ 
        msg: "Appointment rescheduled successfully", 
        appointment: updatedAppointment 
      });
    } catch (err) {
      console.error("Reschedule Error:", err);
      res.status(500).json({ msg: "Server Error during rescheduling", error: err.message });
    }
  }
);

export default router;
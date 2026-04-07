import express from "express";
import Appointment from "../models/Appointment.js";
import Hospital from "../models/Hospital.js"; // 🔥 Added to find hospitalId from userId
// 🔥 FIXED: Imported names now match your authMiddleware.js exactly
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- PATIENT: BOOK APPOINTMENT ---
router.post(
  "/book", 
  authMiddleware, 
  authorizeRoles("patient"), 
  async (req, res) => {
    try {
      const { hospitalId, doctorId, date, time, reason } = req.body;

      const newAppointment = new Appointment({
        patientId: req.user.id, // Extracted from JWT in authMiddleware
        hospitalId,
        doctorId,
        date,
        time,
        reason,
        status: "Pending"
      });

      const savedApp = await newAppointment.save();
      res.status(201).json({ msg: "Appointment requested!", appointment: savedApp });
    } catch (err) {
      res.status(500).json({ msg: "Booking failed", error: err.message });
    }
});

// --- HOSPITAL: MANAGE APPOINTMENTS ---
router.get(
  "/hospital-list", 
  authMiddleware, 
  authorizeRoles("hospital"), 
  async (req, res) => {
    try {
      // 🏥 LOGIC FIX: Find the Hospital document linked to the logged-in User
      const hospitalProfile = await Hospital.findOne({ userId: req.user.id });
      
      if (!hospitalProfile) {
        return res.status(404).json({ msg: "Hospital profile not found" });
      }

      // Query appointments using the Hospital's unique _id
      const list = await Appointment.find({ hospitalId: hospitalProfile._id })
        .populate("patientId", "name phone email")
        // .populate("doctorId", "name specialization") // Uncomment if you have a Doctor model
        .sort({ date: 1, time: 1 });

      res.json(list);
    } catch (err) {
      console.error("Fetch Error:", err);
      res.status(500).json({ msg: "Fetch failed", error: err.message });
    }
});

// --- HOSPITAL: UPDATE APPOINTMENT STATUS ---
router.patch(
  "/update-status/:id", 
  authMiddleware, 
  authorizeRoles("hospital"), 
  async (req, res) => {
    try {
      const { status } = req.body; // e.g., "Confirmed", "Cancelled", "Completed"
      
      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!appointment) return res.status(404).json({ msg: "Appointment not found" });

      res.json({ msg: `Appointment ${status}`, appointment });
    } catch (err) {
      res.status(500).json({ msg: "Update failed" });
    }
});

export default router;
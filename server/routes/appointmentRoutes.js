import express from "express";

import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js"
import {  bookAppointment, getPatientAppointments, cancelAppointment, 
  rescheduleAppointment, getHospitalAppointments, 
  updateAppointmentStatusHospital } from "../controllers/appointmentController.js";



const router = express.Router();

// --- 1. PATIENT: GET MY APPOINTMENTS ---
router.get(
  "/patient-appointments",
  authMiddleware,
  authorizeRoles("patient"),
  getPatientAppointments
);

// --- 2. PATIENT: BOOK APPOINTMENT ---
router.post("/book", authMiddleware, authorizeRoles("patient"), 
bookAppointment);

// --- 3. PATIENT: CANCEL APPOINTMENT ---
// Matches: api.patch(`/api/appointment/${id}/cancel`)
router.patch(
  "/:id/cancel",
  authMiddleware,
  authorizeRoles("patient"),
  cancelAppointment
);

// --- 4. PATIENT/HOSPITAL: RESCHEDULE APPOINTMENT ---
// Matches: api.patch(`/api/appointment/${id}/reschedule`)
router.patch(
  "/:id/reschedule",
  authMiddleware,
  authorizeRoles("hospital", "patient"), 
  rescheduleAppointment
);

// --- 5. HOSPITAL: GET APPOINTMENT LIST ---
router.get(
  "/hospital-list",
  authMiddleware,
  authorizeRoles("hospital"),
  getHospitalAppointments
);

// --- 6. HOSPITAL: UPDATE STATUS ---
router.patch(
  "/update-status/:id",
  authMiddleware,
  authorizeRoles("hospital"),
  updateAppointmentStatusHospital
);

export default router;
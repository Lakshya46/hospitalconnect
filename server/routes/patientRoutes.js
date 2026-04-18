import express from "express";
import { 
  getPatientDashboard, 
  getMyAppointments 
} from "../controllers/patientController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * All routes here are prefixed with /api/patient
 * and require the user to be logged in.
 */

// Dashboard Stats
router.get("/dashboard", authMiddleware, getPatientDashboard);

// Full list of appointments
router.get("/appointments", authMiddleware, getMyAppointments);

export default router;
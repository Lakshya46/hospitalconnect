import express from "express";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import { addDoctor , getDoctors , updateDoctor, deleteDoctor , changeDoctorStatus ,getDoctorById } from "../controllers/doctorController.js";
const router = express.Router();

/**
 * @route   POST /api/doctors/add
 * @desc    Add a new doctor with image and weekly schedule
 */
router.post("/add", authMiddleware, authorizeRoles("hospital"), upload.single("image"), addDoctor);

/**
 * @route   PUT /api/doctors/update/:id
 * @desc    Update full doctor profile including schedule
 */
      router.put("/update/:id", authMiddleware, authorizeRoles("hospital"), upload.single("image"), updateDoctor);

/**
 * @route   PATCH /api/doctors/status/:id
 * @desc    Quickly toggle availability (Available, In Surgery, etc.)
 */
router.patch("/status/:id", authMiddleware, authorizeRoles("hospital"), changeDoctorStatus);

/**
 * @route   DELETE /api/doctors/delete/:id
 * @desc    Remove doctor and decrement hospital count
 */
router.delete("/delete/:id", authMiddleware, authorizeRoles("hospital"), deleteDoctor);

/**
 * @route   GET /api/doctors/list
 * @desc    Get all doctors for the logged-in hospital
 */
router.get("/list", authMiddleware, authorizeRoles("hospital"), getDoctors);
router.get("/details/:id", authMiddleware, authorizeRoles("hospital") , getDoctorById);
export default router;



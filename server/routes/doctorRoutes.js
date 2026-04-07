import express from "express";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

/**
 * @route   POST /api/doctors/add
 * @desc    Add a new doctor with image and weekly schedule
 */
router.post("/add", authMiddleware, authorizeRoles("hospital"), upload.single("image"), async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) return res.status(404).json({ msg: "Hospital profile not found" });

    // 🛠️ PARSE DATA: Convert strings from FormData back to correct types
    const doctorData = { 
      ...req.body, 
      hospitalId: hospital._id,
      experience: Number(req.body.experience) || 0,
      // Parse the schedule string back into a JSON array
      schedule: req.body.schedule ? JSON.parse(req.body.schedule) : [] 
    };
    
    if (req.file) doctorData.image = req.file.path;

    const doctor = new Doctor(doctorData);
    await doctor.save();
    
    // Update doctor count in Hospital model
    await Hospital.findByIdAndUpdate(hospital._id, { $inc: { doctorsCount: 1 } });

    res.status(201).json({ msg: "Doctor added to registry", doctor });
  } catch (err) {
    console.error("Add Doctor Error:", err.message);
    res.status(500).json({ msg: "Failed to add doctor", error: err.message });
  }
});

/**
 * @route   PUT /api/doctors/update/:id
 * @desc    Update full doctor profile including schedule
 */
router.put("/update/:id", authMiddleware, authorizeRoles("hospital"), upload.single("image"), async (req, res) => {
  try {
    const updates = { ...req.body };

    // 🛠️ PARSE DATA
    if (updates.experience) updates.experience = Number(updates.experience);
    if (updates.schedule) updates.schedule = JSON.parse(updates.schedule);
    if (req.file) updates.image = req.file.path;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, 
      { $set: updates }, 
      { new: true, runValidators: true }
    );

    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });

    res.json({ msg: "Doctor profile updated", doctor });
  } catch (err) {
    console.error("Update Doctor Error:", err.message);
    res.status(500).json({ msg: "Update failed", error: err.message });
  }
});

/**
 * @route   PATCH /api/doctors/status/:id
 * @desc    Quickly toggle availability (Available, In Surgery, etc.)
 */
router.patch("/status/:id", authMiddleware, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { availability } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, 
      { availability }, 
      { new: true }
    );
    res.json({ msg: "Status updated", availability: doctor.availability });
  } catch (err) {
    res.status(500).json({ msg: "Status update failed" });
  }
});

/**
 * @route   DELETE /api/doctors/delete/:id
 * @desc    Remove doctor and decrement hospital count
 */
router.delete("/delete/:id", authMiddleware, authorizeRoles("hospital"), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (doctor) {
      await Hospital.findByIdAndUpdate(doctor.hospitalId, { $inc: { doctorsCount: -1 } });
    }
    res.json({ msg: "Doctor removed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Deletion failed" });
  }
});

/**
 * @route   GET /api/doctors/list
 * @desc    Get all doctors for the logged-in hospital
 */
router.get("/list", authMiddleware, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) return res.status(404).json({ msg: "Hospital not found" });

    const doctors = await Doctor.find({ hospitalId: hospital._id }).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ msg: "Fetch failed" });
  }
});

export default router;
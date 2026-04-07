import express from "express";
import Hospital from "../models/Hospital.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/resources/status
 */
router.get("/status", authMiddleware, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id })
      .select("beds icu oxygen emergencyStatus");
    
    if (!hospital) return res.status(404).json({ msg: "Hospital profile not found" });

    // Ensure objects exist so frontend doesn't crash
    const safeData = {
      beds: hospital.beds || { total: 0, available: 0 },
      icu: hospital.icu || { total: 0, available: 0 },
      oxygen: hospital.oxygen || { total: 0, available: 0 },
      emergencyStatus: hospital.emergencyStatus || { isEROpen: true, isAmbulanceAvailable: false }
    };

    res.json(safeData);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

/**
 * @route   PATCH /api/resources/update
 */
router.patch("/update", authMiddleware, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { category, field, value } = req.body; 
    const updateKey = `${category}.${field}`;
    
    // Check if hospital exists first to avoid null errors
    const check = await Hospital.findOne({ userId: req.user.id });
    if (!check) return res.status(404).json({ msg: "Hospital not found" });

    const hospital = await Hospital.findOneAndUpdate(
      { userId: req.user.id },
      { $inc: { [updateKey]: value } },
      { returnDocument: 'after' } 
    );

    res.json({ msg: "Occupancy updated", data: hospital[category] });
  } catch (err) {
    console.error("Error updating resource:", err.message);
    res.status(500).json({ msg: "Update failed", error: err.message });
  }
});

router.patch("/set-total", authMiddleware, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { category, value } = req.body;
    const updateKey = `${category}.total`;
    
    const hospital = await Hospital.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { [updateKey]: parseInt(value) || 0 } },
      { returnDocument: 'after' }
    );

    if (!hospital) return res.status(404).json({ msg: "Hospital not found" });
    res.json({ msg: "Total updated", data: hospital[category] });
  } catch (err) {
    res.status(500).json({ msg: "Manual update failed", error: err.message });
  }
});

/**
 * @route   PATCH /api/resources/toggle-emergency
 */
router.patch("/toggle-emergency", authMiddleware, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { field } = req.body; 
    const hospital = await Hospital.findOne({ userId: req.user.id });
    
    if (!hospital) return res.status(404).json({ msg: "Hospital not found" });

    // Ensure emergencyStatus object exists before toggling
    if (!hospital.emergencyStatus) {
      hospital.emergencyStatus = { isEROpen: true, isAmbulanceAvailable: false };
    }

    hospital.emergencyStatus[field] = !hospital.emergencyStatus[field];
    
    // Mark as modified so Mongoose knows to save the nested object
    hospital.markModified('emergencyStatus'); 
    await hospital.save();
    
    res.json({ msg: "Emergency status updated", status: hospital.emergencyStatus });
  } catch (err) {
    console.error("Toggle Error:", err.message);
    res.status(500).json({ msg: "Toggle failed", error: err.message });
  }
});

export default router;
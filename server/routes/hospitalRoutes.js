import express from "express";
import Hospital from "../models/Hospital.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js"; // 🔥 Import BOTH
import { upload } from "../config/cloudinary.js"; 
import Doctor from "../models/Doctor.js"; // 🔥 Import Doctor model for fetching doctors of a hospital

const router = express.Router();

// 🏥 CREATE HOSPITAL PROFILE
router.post(
  "/create",
  authMiddleware,               // ✅ 1. Check if logged in
  authorizeRoles("hospital"),   // ✅ 2. Check if role is hospital (FIXED NAME)
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const existing = await Hospital.findOne({ userId: req.user.id });
      if (existing) {
        return res.status(400).json({ msg: "Hospital profile already exists" });
      }

      const hospitalData = { ...req.body };

      if (req.files) {
        if (req.files.image) hospitalData.image = req.files.image[0].path;
        if (req.files.coverPhoto) hospitalData.coverPhoto = req.files.coverPhoto[0].path;
      }

      if (typeof hospitalData.coordinates === "string") {
        hospitalData.coordinates = JSON.parse(hospitalData.coordinates);
      }

      const hospital = new Hospital({
        userId: req.user.id,
        ...hospitalData
      });

      await hospital.save();
      res.status(201).json({ msg: "Hospital created successfully", hospital });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  }
);

// ✏️ UPDATE HOSPITAL PROFILE
// ... existing imports

// ✏️ UPDATE HOSPITAL PROFILE
router.put(
  "/update",
  authMiddleware,
  authorizeRoles("hospital"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const updates = { ...req.body };

      // 🛡️ Security: Prevent users from self-verifying via API
      const restrictedFields = ["userId", "isVerified"];
      restrictedFields.forEach(field => delete updates[field]);

      // 🖼️ Handle Image Uploads
      if (req.files) {
        if (req.files.image) updates.image = req.files.image[0].path;
        if (req.files.coverPhoto) updates.coverPhoto = req.files.coverPhoto[0].path;
      }

      // 🏥 FIX: Parse 'type' Array if sent as JSON string (from FormData)
      if (updates.type && typeof updates.type === "string") {
        try {
          updates.type = JSON.parse(updates.type);
        } catch (e) {
          // If it's a single value not wrapped in [], turn it into an array
          updates.type = [updates.type];
        }
      }

      // 📍 Parse Coordinates
      if (updates.coordinates && typeof updates.coordinates === "string") {
        try {
          updates.coordinates = JSON.parse(updates.coordinates);
        } catch (e) {
          return res.status(400).json({ msg: "Invalid coordinates format" });
        }
      }

      // 🚀 Perform Update
      const updated = await Hospital.findOneAndUpdate(
        { userId: req.user.id },
        { ...updates, profileCompleted: true },
        { 
          returnDocument: 'after', // ✅ FIXED: Replaced 'new: true' to remove warning
          runValidators: true      // ✅ Ensures the 'enum' check still happens
        }
      );

      if (!updated) return res.status(404).json({ msg: "Hospital profile not found" });

      res.json({ msg: "Profile Synced Successfully", hospital: updated });
    } catch (err) {
      console.error("Update Error Detail:", err); // Log full error to terminal
      res.status(500).json({ msg: "Update failed", error: err.message });
    }
  }
);

// ... rest of the routes
// routes/hospitalRoutes.js
// routes/hospitalRoutes.js (Search Controller)

// routes/hospitalRoutes.js (or wherever your search route is)
router.get("/search-resources", async (req, res) => {
  try {
    const { type, qty } = req.query;
    const requestedQty = parseInt(qty) || 1;

    console.log(`DEBUG: Searching for ${type} with qty ${requestedQty}`);

    // 1. Define the mapping from Frontend string -> Model Path
    const typeMapping = {
      // Supplies
      "Oxygen": "oxygen.available",
      "ICU Bed": "icu.available",
      "General Hospital": "beds.available",
      
      // Blood Groups (Maps "A+" to "bloodBank.A_pos")
      "A+": "bloodBank.A_pos", "A-": "bloodBank.A_neg",
      "B+": "bloodBank.B_pos", "B-": "bloodBank.B_neg",
      "O+": "bloodBank.O_pos", "O-": "bloodBank.O_neg",
      "AB+": "bloodBank.AB_pos", "AB-": "bloodBank.AB_neg"
    };

    let query = {};

    if (typeMapping[type]) {
      // Use bracket notation to create a dynamic key query
      // Result: { "oxygen.available": { $gte: 5 } }
      query[typeMapping[type]] = { $gte: requestedQty };
    } 
    else {
      // If it's a Doctor specialty (like "Cardiology"), search the departments array
      query["departments"] = { $in: [type] };
    }

    // 2. Add verification filter (if you want only verified hospitals)
    // query.isVerified = true; 

    const hospitals = await Hospital.find(query);

    console.log(`DEBUG: Found ${hospitals.length} hospitals for query:`, query);
    res.json(hospitals);

  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ msg: "Server error during discovery" });
  }
});

router.get("/doctors/:hospitalId", async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospitalId: req.params.hospitalId });
    res.json(doctors);
  } catch (err) {
    console.error("Doctor Fetch Error:", err);
    res.status(500).json({ msg: "Failed to fetch doctors" });
  }
});

// 🌍 GET ALL HOSPITALS (PUBLIC)
router.get("/all", async (req, res) => {
  try {
    const hospitals = await Hospital.find().select("-__v");
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 📄 GET MY HOSPITAL PROFILE (PRIVATE)
router.get(
  "/me",
  authMiddleware,
  authorizeRoles("hospital"),
  async (req, res) => {
    try {
      const hospital = await Hospital.findOne({ userId: req.user.id });
      if (!hospital) return res.status(404).json({ msg: "Hospital not found" });
      res.json(hospital);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  }
);

// 🔍 GET HOSPITAL BY ID (PUBLIC)
router.get("/by-id/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ msg: "Hospital not found" });
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 🗑️ DELETE HOSPITAL (ADMIN ONLY)
router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const hospital = await Hospital.findByIdAndDelete(req.params.id);
      if (!hospital) return res.status(404).json({ msg: "Hospital not found" });
      res.json({ msg: "Hospital deleted successfully" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  }
);



export default router;


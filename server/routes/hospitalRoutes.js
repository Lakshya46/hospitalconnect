import express from "express";
import Hospital from "../models/Hospital.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js"; // 🔥 Import BOTH
import { upload } from "../config/cloudinary.js"; 
import Doctor from "../models/Doctor.js"; // 🔥 Import Doctor model for fetching doctors of a hospital
import { getDashboardStats } from "../controllers/hospitalController.js"; // 🔥 Import the new controller function
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

      // 🏥 FIX: Parse 'type' Array
      if (updates.type && typeof updates.type === "string") {
        try {
          updates.type = JSON.parse(updates.type);
        } catch (e) {
          updates.type = [updates.type];
        }
      }

      // 🗓️ NEW FIX: Parse 'workingDays' Array (This was missing!)
      if (updates.workingDays && typeof updates.workingDays === "string") {
        try {
          updates.workingDays = JSON.parse(updates.workingDays);
        } catch (e) {
          updates.workingDays = updates.workingDays.split(","); // Fallback if not JSON
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
          returnDocument: 'after', 
          runValidators: true 
        }
      );

      if (!updated) return res.status(404).json({ msg: "Hospital profile not found" });

      res.json({ msg: "Profile Synced Successfully", hospital: updated });
    } catch (err) {
      console.error("Update Error Detail:", err);
      res.status(500).json({ msg: "Update failed", error: err.message });
    }
  }
);


router.get(
  "/dashboard-stats", 
  authMiddleware,authorizeRoles("hospital"),
  getDashboardStats
);
// ... rest of the routes
// routes/hospitalRoutes.js
// routes/hospitalRoutes.js (Search Controller)

// routes/hospitalRoutes.js (or wherever your search route is)
// routes/hospitalRoutes.js (Search Controller)

// ✅ 1. Add 'auth' middleware to get req.user
router.get("/search-resources", authMiddleware, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { type, qty, category } = req.query;
    const requestedQty = parseInt(qty) || 1;

    // ✅ 2. Find the Hospital ID of the user making the request
    const requesterHospital = await Hospital.findOne({ userId: req.user.id });
    if (!requesterHospital) {
        return res.status(404).json({ msg: "Requester hospital profile not found" });
    }

    const typeMapping = {
      "Oxygen": "oxygen.available",
      "ICU Bed": "icu.available",
      "General Bed": "beds.general.available",
      "A+": "bloodBank.A_pos", "A-": "bloodBank.A_neg",
      "B+": "bloodBank.B_pos", "B-": "bloodBank.B_neg",
      "O+": "bloodBank.O_pos", "O-": "bloodBank.O_neg",
      "AB+": "bloodBank.AB_pos", "AB-": "bloodBank.AB_neg"
    };

    // ✅ 3. Initialize query with two global filters:
    // - Profile must be completed
    // - _id must NOT be the requester's hospital ID
    let query = { 
      profileCompleted: true,
      _id: { $ne: requesterHospital._id } 
    };

    if (category === "Doctor") {
      const matchingDoctors = await Doctor.find({ 
        specialization: type, 
        availability: "Available" 
      }).select("hospitalId");

      const hospitalIds = [...new Set(matchingDoctors.map(doc => doc.hospitalId))];

      // ✅ 4. Combine 'Not Self' with 'Doctor Specialization'
      // We filter the found IDs to exclude the requester's ID
      query["_id"] = { 
        $in: hospitalIds, 
        $ne: requesterHospital._id 
      };
    } 
    else if (typeMapping[type]) {
      query[typeMapping[type]] = { $gte: requestedQty };
    } 
    else {
      query["departments"] = { $in: [type] };
    }

    const hospitals = await Hospital.find(query);

    console.log(`DEBUG: Found ${hospitals.length} external hospitals`);
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


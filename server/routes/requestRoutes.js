import express from "express";
const router = express.Router();
// 1. Fixed the import name to match your controller export
import { createRequest, acceptRequest } from "../controllers/resourceController.js"; 
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";
import ResourceRequest from "../models/ResourceRequest.js";
import Hospital from "../models/Hospital.js";

/**
 * @route   POST /api/requests/request
 * Initiates a bundle request (Broadcast or Direct)
 */
router.post("/request", authMiddleware, authorizeRoles("hospital"), createRequest);

/**
 * @route   GET /api/requests/my-requests
 * Fetches the history of requests sent by the logged-in hospital
 */
router.get("/my-requests", authMiddleware, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) return res.status(404).json({ msg: "Hospital not found" });

    const requests = await ResourceRequest.find({ senderHospitalId: hospital._id })
      .populate("receiverHospitalId", "name")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch requests", error: err.message });
  }
});

/**
 * @route   PATCH /api/requests/accept/:id
 * For the provider hospital to accept a request
 */
router.patch("/accept/:id", authMiddleware, authorizeRoles("hospital"), acceptRequest);
// routes/requestRoutes.js (or your specific request controller)

// routes/requestRoutes.js

router.patch("/cancel/:id", authMiddleware, async (req, res) => {
  try {
    // 1. First, find the Hospital associated with the logged-in User
    const hospital = await Hospital.findOne({ userId: req.user.id });
    
    if (!hospital) {
      return res.status(404).json({ msg: "Hospital profile not found" });
    }

    // 2. Find the request using the Hospital's ID, not the User's ID
    const request = await ResourceRequest.findOne({ 
      _id: req.params.id, 
      senderHospitalId: hospital._id // 🔥 FIXED: Using hospital._id instead of req.user.id
    });

    if (!request) {
      // This is likely why you saw a 404/Not Found
      return res.status(404).json({ msg: "Request not found or unauthorized to withdraw" });
    }

    // 3. Prevent cancellation if the request is already processed
    if (request.status !== "Pending") {
      return res.status(400).json({ 
        msg: `Cannot withdraw request. Current status is already ${request.status}.` 
      });
    }

    // 4. Update status to Cancelled
    request.status = "Cancelled";
    await request.save();

    res.json({ 
      msg: "Resource request successfully withdrawn", 
      requestId: request._id 
    });
    
  } catch (err) {
    console.error("Cancel Request Error:", err);
    res.status(500).json({ msg: "Server error during cancellation" });
  }
});
export default router;
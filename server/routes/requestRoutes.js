import express from "express";
const router = express.Router();
// 1. Fixed the import name to match your controller export
import { createRequest, acceptRequest , rejectRequest } from "../controllers/resourceController.js"; 
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

router.patch("/cancel/:id", authMiddleware, authorizeRoles("hospital"), rejectRequest);
export default router;
import express from "express";
import { signup, login ,getMe ,updateProfile } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js"; // 🔥 Import User model for subscription saving
import { upload } from "../config/cloudinary.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
// Add this to your existing auth routes

router.put("/update-profile", authMiddleware, upload.single("profilePic"), updateProfile);

router.post("/save-subscription", authMiddleware, async (req, res) => {
  try {
    const subscription = req.body;
    
    // req.user.id comes from your authMiddleware
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { pushSubscription: subscription },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "Subscription saved successfully" });
  } catch (err) {
    console.error("Error saving subscription:", err.message);
    res.status(500).json({ msg: "Internal Server Error", error: err.message });
  }
});


export default router;
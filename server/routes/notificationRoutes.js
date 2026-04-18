import express from "express";
const router = express.Router();
import { getNotifications, handleNotificationAction } from "../controllers/notificationController.js";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";

router.get("/", authMiddleware, authorizeRoles("hospital"), getNotifications);
router.patch("/action/:id", authMiddleware, authorizeRoles("hospital"), handleNotificationAction);

export default router;
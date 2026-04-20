import express from "express";
import authMiddleware, { authorizeRoles } from "../middleware/authMiddleware.js";
import { addBlood, updateBlood } from "../controllers/bloodController.js";

const router = express.Router();

router.get(
  "/inventory",
  authMiddleware,
  authorizeRoles("hospital"),
  addBlood
);

router.patch(
  "/update",
  authMiddleware,
  authorizeRoles("hospital"),
  updateBlood
);

export default router;
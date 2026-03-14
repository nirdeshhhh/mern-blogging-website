import express from "express";
import { getNotifications } from "../controllers/notificationController.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/notifications", verifyJWT, getNotifications);

export default router;
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {getNotifications,markAllAsRead} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/getNotifications",protect,getNotifications)

// Mark all notifications as read
router.put("/read-all", protect, markAllAsRead);

export default router;

import express from "express";
import { sendMessage,getConversation,getUserChats, markConversationRead } from "../controllers/messageController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const router  = express.Router();

// Send a message (supports image/video)
router.post("/sendmessage", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), sendMessage);

// Get conversation between two users
router.get("/conversation/:userId/:otherUserId", getConversation);

// Mark conversation as read
router.put("/conversation/:userId/:otherUserId/read", markConversationRead);

// Get all chats for a user
router.get("/chats/:userId", getUserChats);

export default router;
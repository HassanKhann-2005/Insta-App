import express from "express";
import multer from "multer";
import { uploadProfilePic } from "../controllers/profilepicController.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // local folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Route for uploading profile picture
router.put("/upload/:id", upload.single("profilePicture"), uploadProfilePic);

export default router;

// profilePicture is coming from frontend in formData from profilepicSlice.js

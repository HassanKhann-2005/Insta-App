import express from "express";
import multer from "multer";
import { createStory,fetchStories,viewStory,fetchUserStories } from "../controllers/storyController.js";

const router = express.Router();

// Multer config for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Routes
router.post("/:userId/uploadstory", upload.single("media"), createStory); // create story
router.get("/getstories", fetchStories); // fetch all active stories
router.put("/:storyId/viewstory", viewStory); // mark as viewed
router.get("/:userId/getstory", fetchUserStories);

export default router;

import express from "express";
import multer from "multer";
import { fetchPosts,createPost,getPaginatedPosts } from "../controllers/postsController.js";
import {toggleLike} from "../controllers/likesController.js";
import {addComment} from "../controllers/commentController.js";

const router = express.Router();

// ================= Multer setup =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // local uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ================= Routes =================

// Create post with userId in URL
router.post("/createPosts/:userId", upload.array("images", 5), createPost);

// Fetch all posts by userId
router.get("/fetchPosts/:userId", fetchPosts);

// Post Likes
router.post("/like/:postId",toggleLike);

// Post Comments

router.post("/comment/:postId",addComment);

// get Posts

router.get("/getPosts",getPaginatedPosts);


export default router;

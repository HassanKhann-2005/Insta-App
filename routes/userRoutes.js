import express from "express";
import { RegisterUser, LoginUser, getAllUsers,getCurrentUser,followUser, unfollowUser, getFollowData, getUserById, updateBio } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register new user
router.post("/register", RegisterUser);

// Login user
router.post("/login", LoginUser);

// Get all users (protected route if you want later)
router.get("/getUsers", getAllUsers);

router.get("/me", protect, getCurrentUser);

// Follow
router.put("/:id/follow", followUser);

// Unfollow
router.put("/:id/unfollow", unfollowUser);

// Get users followers and following:
router.get("/:id/follow-data",getFollowData);

//Get user by id
router.get("/:id/getUserById",getUserById);

// Update bio
router.put("/:userId/bio", updateBio);

export default router;


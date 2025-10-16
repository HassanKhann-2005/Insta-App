import Story from "../models/stories.js";
import User from "../models/users.js";

// ================= CREATE STORY =================
export const createStory = async (req, res) => {
  try {
    const { userId } = req.params; // ✅ get userId from URL
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "A story image or video is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Store uploaded file path
    const mediaUrl = `/uploads/${file.filename}`;

    const newStory = new Story({
      user: userId,
      media: mediaUrl,
      mediaType: file.mimetype.startsWith("video") ? "video" : "image",
    });

    const savedStory = await newStory.save();

    res.status(201).json({
      message: "Story created successfully",
      story: savedStory,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET ALL ACTIVE STORIES =================
export const fetchStories = async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: Date.now() } })
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= VIEW STORY =================
// ✅ Mark story as viewed
export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { userId } = req.body;

    // check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // check if already viewed
    if (!story.viewers.includes(userId)) {
      story.viewers.push(userId);
      await story.save();
    }

    // ✅ populate user and viewers so frontend gets full info
    const populatedStory = await Story.findById(storyId)
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture");

    res.status(200).json(populatedStory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating viewers" });
  }
};

// ================= FETCH STORY BY ID =================
export const fetchUserStories = async (req, res) => {
  try {
    const { userId } = req.params;
    const stories = await Story.find({ user: userId })
      .populate("user", "username profilePicture")
      .populate("viewers", "username profilePicture")
      .sort({ createdAt: -1 });

    if (!stories || stories.length === 0) {
      return res.status(404).json({ message: "No stories found for this user" });
    }

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).json({ message: "Server error while fetching stories" });
  }
};

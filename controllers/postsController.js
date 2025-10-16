import Post from "../models/posts.js";
import User from "../models/users.js";

// ================= CREATE POST =================
export const createPost = async (req, res) => {
  try {
    const { userId } = req.params; // ✅ get userId from URL
    const { caption } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Store image URLs
    const imageUrls = files.map((file) => `/uploads/${file.filename}`);

    const newPost = new Post({
      user: userId,
      caption,
      images: imageUrls,
    });

    const savedPost = await newPost.save();

    // Optional: If User model has `posts` array
    await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET ALL POSTS =================
export const fetchPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// infinite scroll - pagination
export const getPaginatedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 7 } = req.query;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "username profilePicture")
        .populate("comments.user", "username profilePicture")
        .populate("likes", "username profilePicture"),
      Post.countDocuments(),
    ]);

    const hasMore = skip + posts.length < total;

    res.json({
      posts,
      hasMore,
      page: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



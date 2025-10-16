import Post from "../models/posts.js";
import User from "../models/users.js";
import Notification from "../models/notifications.js";

// Logic for Posting Likes

export const toggleLike = async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;
  
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
  
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id.toString() !== userId);
      } else {
        post.likes.push(userId);
      }

       // 👉 Create notification only if someone else liked (not self-like)
       if (post.user.toString() !== userId) {
        await Notification.create({
          receiver: post.user,   // post owner
          sender: userId,        // liker
          type: "like",
          post: post._id
        });
      }
  
  
      await post.save();
  
      // 🔑 Populate again before sending back
      const updatedPost = await Post.findById(postId)
      .populate("user", "username profilePicture") // for post owner
      .populate("comments.user", "username profilePicture") // for commenters
      .populate("likes", "username profilePicture"); // for likers
    
  
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
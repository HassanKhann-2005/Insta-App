import Post from "../models/posts.js";
import Notification from "../models/notifications.js";

export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, text } = req.body;

        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.comments.push({ user: userId, text });
        await post.save();

        // 👉 Create notification only if commenter != post owner
    if (post.user.toString() !== userId) {
        await Notification.create({
          receiver: post.user,   // post owner
          sender: userId,        // commenter
          type: "comment",
          post: post._id
        });
      }

        // 🔑 Populate user info for comments and likes before sending back
        const updatedPost = await Post.findById(postId)
            .populate("user", "username profilePicture") // for post owner
            .populate("comments.user", "username profilePicture") // for commenters
            .populate("likes", "username profilePicture"); // for likers


        res.status(201).json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// controller/messages.js
export const MarkAsRead = async (req, res) => {
    try {
      const userId = req.user.id;           // logged in user
      const { chatId } = req.params;        // chat opened by user
  
      // Update all unread messages for this chat where current user is the receiver
      await Message.updateMany(
        { chatId, receiverId: userId, isRead: false },
        { $set: { isRead: true } }
      );
  
      res.status(200).json({ success: true, message: "Messages marked as read" });
    } catch (err) {
      console.error("Error marking messages as read:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };




import Notification from "../models/notifications.js";

// Get all notifications for logged-in user
export const getNotifications = async (req, res) => {
    try {
      const userId = req.user.id; // coming from auth middleware (logged-in user)
  
      const notifications = await Notification.find({ receiver: userId })
        .populate("sender", "username profilePicture")
        .populate("post", "image caption")
        .populate("message", "content createdAt") // ✅ get message text instead of ID
        
        .sort({ createdAt: -1 }); // latest first
  
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Mark all as read
export const markAllAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
  
      await Notification.updateMany(
        { receiver: userId, isRead: false },
        { $set: { isRead: true } }
      );
  
      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
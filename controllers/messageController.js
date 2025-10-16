import Message from "../models/messages.js";
import User from "../models/users.js";
import Notification from "../models/notifications.js";
import path from "path";

// Create a new message

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const hasText = content && content.trim().length > 0;
    const imageFile = req.files?.image?.[0] || null;
    const videoFile = req.files?.video?.[0] || null;

    console.log("sendMessage req.body:", req.body);
    console.log("sendMessage req.files:", Object.keys(req.files || {}));

    if (!senderId || !receiverId || (!hasText && !imageFile && !videoFile)) {
      return res.status(400).json({ message: "Provide text or media." });
    }

    const computedContent = hasText ? content : (imageFile || videoFile) ? "Sent an attachment" : undefined;

    const message = new Message({
      senderId,
      receiverId, // ✅ matches schema
      content: computedContent,
      image: imageFile ? `/uploads/${imageFile.filename}` : undefined,
      video: videoFile ? `/uploads/${videoFile.filename}` : undefined,
    });

    await message.save();

      // ✅ Create notification for receiver
      let notification = null;
      try {
        notification = new Notification({
          type: "message",
          sender: senderId,
          receiver: receiverId,
          attachment: imageFile || videoFile,
          message: message._id,
        });
        await notification.save();
      } catch (err) {
        console.warn("Notification save failed:", err?.message);
      }

      res.status(201).json({
        message: "Message sent successfully",
        data: message, notification,
      });
      
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get conversation between two users
export const getConversation = async (req, res) => {
    try {
      const { userId, otherUserId } = req.params;
  
      const messages = await Message.find({
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      }).sort({ createdAt: 1 }); // oldest first
  
      res.status(200).json({ success: true, messages });
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ error: "Server error" });
    }
  };

// Mark messages as read in a conversation (receiver viewing messages from sender)
export const markConversationRead = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const result = await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return res.status(200).json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
  
  // Get all chats for a user (last messages only)
export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$receiverId", // if I sent, group by receiver
              "$senderId",   // if I received, group by sender
            ],
          },
          lastMessage: { $first: "$content" },
          lastTime: { $first: "$createdAt" },
          unreadCount: { $sum: { $cond: [{ $and: [ { $eq: ["$receiverId", userId] }, { $eq: ["$isRead", false] } ] }, 1, 0] } },
        },
      },
      { $sort: { lastTime: -1 } },
    ]);

    // ✅ Now populate name + profilePicture from User collection
    const populatedChats = await Promise.all(
      chats.map(async (chat) => {
        const user = await User.findById(chat._id).select("name profilePicture");
        return {
          _id: chat._id,
          lastMessage: chat.lastMessage,
          lastTime: chat.lastTime,
          otherUserName: user?.name || "Unknown",
          otherUserPic: user?.profilePicture || "",
          unreadCount: chat.unreadCount || 0,
        };
      })
    );

    res.status(200).json({ success: true, chats: populatedChats });
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

  
// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String
    },
    receiverName: {
      type: String
    },

    senderProfilePic: {
      type: String
    },   // ✅ add this

    receiverProfilePic: {
      type: String
    }, // ✅ keep this
    
    content: {
      type: String,
    },
    image:{
      type: String,
    },
    video:{
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    }
  },
  { timestamps: true } // automatically adds createdAt, updatedAt
);

export default mongoose.model("Message", messageSchema);

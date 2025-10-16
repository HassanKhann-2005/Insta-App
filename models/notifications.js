import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "comment", "follow", "message"], required: true }, // ✅ added "message"
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // only for like/comment
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // ✅ optional: for chat messages
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;

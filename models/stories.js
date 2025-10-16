import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      type: String, // could be image or video URL
      required: true,
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    expiresAt: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
    },
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);

export default Story;

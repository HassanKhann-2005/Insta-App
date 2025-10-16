import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:
    {
      type: String,
      required: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    profilePicture: {
      type: String,
      default: "", // you can store Cloudinary / S3 link
    },
    bio: {
      type: String,
      maxlength: 150,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post", // assuming you’ll create models/Post.js later
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
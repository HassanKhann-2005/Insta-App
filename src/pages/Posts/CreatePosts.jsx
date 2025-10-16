import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../app/features/posts/postSlice";
import { fetchCurrentUser } from "../../app/features/auth/authSlice";
import { uploadStory } from "../../app/features/stories/storiesSlice";
import Swal from "sweetalert2";

const CreatePosts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.posts);
  const { currentUser } = useSelector((state) => state.app);

  // Post states
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState([]);

  // Story states
  const [storyFile, setStoryFile] = useState(null);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Handlers
  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleStoryChange = (e) => {
    setStoryFile(e.target.files[0]);
  };

  // Submit Post
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!caption && images.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Please add a caption or upload images for your post.",
      });
      return;
    }

    try {
      await dispatch(
        createPost({ userId: currentUser?.id, caption, images })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: "Post Created!",
        text: "Your post has been uploaded successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to create post: " + err,
      });
    }

    setCaption("");
    setImages([]);
  };

  // Submit Story
  const handleStorySubmit = async (e) => {
    e.preventDefault();

    if (!storyFile) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Please select an image or video for your story.",
      });
      return;
    }

    try {
      await dispatch(
        uploadStory({ userId: currentUser?.id, file: storyFile })
      ).unwrap();

      Swal.fire({
        icon: "success",
        title: "Story Uploaded!",
        text: "Your story has been uploaded successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to upload story: " + err,
      });
    }

    setStoryFile(null);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center min-h-screen bg-gray-900 p-6 gap-8">
      {/* Post Form */}
      <form
        onSubmit={handlePostSubmit}
        className="max-w-md w-full p-6 bg-gray-800 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-semibold text-blue-300 mb-4">
          Create a Post
        </h2>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Upload Pictures
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full text-white bg-gray-700 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Caption */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Caption/Description
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full h-24 text-white bg-gray-700 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add your caption..."
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          {loading ? "Posting..." : "Post"}
        </button>

        {error && <p className="text-red-400 text-sm mt-2">Error: {error}</p>}
      </form>

      {/* Story Form */}
      <form
        onSubmit={handleStorySubmit}
        className="max-w-md w-full p-6 bg-gray-800 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-semibold text-green-300 mb-4">
          Upload a Story
        </h2>

        {/* Story Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Upload Story (Image/Video)
          </label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleStoryChange}
            className="w-full text-white bg-gray-700 p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          {loading ? "Uploading..." : "Upload Story"}
        </button>
      </form>
    </div>
  );
};

export default CreatePosts;

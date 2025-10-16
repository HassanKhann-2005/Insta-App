import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { addComment } from "../../app/features/posts/postSlice";
import { buildMediaUrl } from "../../constants/api";


const Comments = ({ selectedPost, onClose }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.app);
  const livePost = useSelector((state) =>
    state.posts.posts.find((p) => p._id === selectedPost?._id)
  );
  const post = livePost || selectedPost;

  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const handleComment = async () => {
    if (!commentText.trim() || !currentUser?.id) return;

    setIsCommenting(true);
    try {
      await dispatch(
        addComment({ postId: post._id, userId: currentUser.id, text: commentText })
      ).unwrap();
      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#121212] rounded-lg w-[90%] md:w-[70%] h-[80%] flex overflow-hidden">
        {/* Left: Post Image */}
        <div className="hidden md:block flex-1 bg-black">
          {post.images?.length > 0 && (
            <img
              src={buildMediaUrl(post.images[0])}
              alt="post"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Right: Comments */}
        <div className="flex flex-col w-full md:w-[40%]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-start gap-2">
              <img
                src={
                  post.user?.profilePicture
                    ? buildMediaUrl(post.user.profilePicture)
                    : "https://via.placeholder.com/30"
                }
                alt="profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex items-center gap-2">
                <span className="font-semibold">{post.user?.username}</span>
                {post.caption && (
                  <span className="text-sm text-gray-300">{post.caption}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {post.comments?.length > 0 ? (
              post.comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <img
                    src={
                      c.user?.profilePicture
                        ? buildMediaUrl(c.user.profilePicture)
                        : "https://via.placeholder.com/25"
                    }
                    alt="profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div>
                    <span className="font-semibold mr-2">
                      {c.user?.username || "User"}
                    </span>
                    <span className="text-gray-300">{c.text}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet</p>
            )}
          </div>

          {/* Add Comment */}
          <div className="p-3 border-t border-gray-800 flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3 py-2 rounded bg-gray-800 text-gray-200 text-sm outline-none"
            />
            <button
              onClick={handleComment}
              disabled={isCommenting}
              className={`text-sm font-semibold ${
                isCommenting ? "text-gray-500 cursor-not-allowed" : "text-blue-500"
              }`}
            >
              {isCommenting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;

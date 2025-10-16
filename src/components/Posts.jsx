import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment } from "@fortawesome/free-solid-svg-icons";
import { fetchCurrentUser } from "../app/features/auth/authSlice";
import { toggleLike, getPosts } from "../app/features/posts/postSlice";
import { useNavigate } from "react-router-dom";
import Comments from "./comments/comments";
import { buildMediaUrl } from "../constants/api";


const Posts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { posts, page, hasMore, loading } = useSelector((state) => state.posts);
  const { currentUser } = useSelector((state) => state.app);

  const [selectedPost, setSelectedPost] = useState(null);
  const loaderRef = useRef(null);

  // Load user
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Initial posts fetch - only once
  useEffect(() => {
    if (page === 1 && posts.length === 0 && !loading) {
      dispatch(getPosts({ page: 1 }));
    }
  }, [dispatch, page, posts.length, loading]);

  // Infinite scroll observer with guard and small rootMargin to prefetch
  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;

    let ticking = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (ticking) return;
        ticking = true;
        if (!loading && hasMore) {
          dispatch(getPosts({ page: page + 1 }));
        }
        // release tick after a short delay to debounce rapid callbacks
        setTimeout(() => {
          ticking = false;
        }, 300);
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
      observer.disconnect();
    };
  }, [dispatch, page, hasMore, loading]);

  const handleLike = (postId) => {
    if (!currentUser?.id) return;
    dispatch(toggleLike({ postId, userId: currentUser.id }));
  };

  return (
    <div className="space-y-6 sm:space-y-10 my-6 sm:my-10">
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post._id}
            className="bg-[#121212] border border-gray-800 rounded-xl overflow-hidden shadow-md"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <img
                src={post.user?.profilePicture ? buildMediaUrl(post.user.profilePicture) : "https://via.placeholder.com/40"}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span
                className="font-semibold text-sm cursor-pointer"
                onClick={() => navigate(`/userprofile/${post.user?._id}`)}
              >
                {post.user?.username}
              </span>
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Post Image */}
            {post.images && post.images.length > 0 && (
              <img
                src={buildMediaUrl(post.images[0])}
                alt="post"
                className="w-full max-h-[70vh] object-cover sm:rounded-lg"
              />
            )}

            {/* Post Details */}
            <div className="p-4">
              {/* Likes & Comments */}
              <div className="flex items-center gap-4 mb-3">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`transition ${
                    post.likes?.includes(currentUser?.id)
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-300">
                  {post.likes?.length || 0} likes
                </span>

                <button onClick={() => setSelectedPost(post)}>
                  <FontAwesomeIcon
                    icon={faComment}
                    className="w-5 h-5 text-gray-400 ml-4"
                  />
                </button>
                <span className="text-sm text-gray-300">
                  {post.comments?.length || 0} comments
                </span>
              </div>

              {/* Caption */}
              <p className="text-sm text-gray-200 mb-2">
                <span className="font-semibold">{post.user?.username} </span>
                {post.caption || ""}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center">No posts available</p>
      )}

      {/* Loader */}
      {loading && <p className="text-gray-400 text-center">Loading...</p>}
      <div ref={loaderRef} style={{ height: "40px" }} />

      {/* ✅ Comments Modal */}
      {selectedPost && (
        <Comments
          selectedPost={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default Posts;

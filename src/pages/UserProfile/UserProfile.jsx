import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaRegHeart,
    FaHeart,
    FaRegComment,
    FaRegPaperPlane,
    FaRegBookmark,
} from "react-icons/fa";

import { fetchUserById, followUser, unfollowUser } from "../../app/features/auth/authSlice";
import { fetchUserStories } from "../../app/features/stories/storiesSlice";
import { buildMediaUrl } from "../../constants/api";

const UserProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { users, loading, error, currentUser } = useSelector((state) => state.app);
    const { stories, loading: storiesLoading } = useSelector((state) => state.stories);

    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [likedPosts, setLikedPosts] = useState({});
    const [isFollowing, setIsFollowing] = useState(false);

    // ✅ Story Modal
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [selectedStory, setSelectedStory] = useState(null);

    // ✅ Comment Modal
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchUserById(id));
            dispatch(fetchUserStories(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (users && currentUser) {
            const following = users.followers?.some(
                (follower) => follower._id === currentUser.id
            );
            setIsFollowing(following);
        }
    }, [users, currentUser]);

    const handleFollow = () => {
        if (!currentUser) return;

        if (isFollowing) {
            dispatch(unfollowUser({ currentUserId: currentUser.id, targetUserId: id }));
            setIsFollowing(false);
        } else {
            dispatch(followUser({ currentUserId: currentUser.id, targetUserId: id }));
            setIsFollowing(true);
        }
    };

    const handleLike = (postId) => {
        if (!currentUser?.id) return;
        setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    if (loading) return <p className="text-center text-white">Loading...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto p-6">
                {/* Profile Header */}
                {/* ... (your profile header, bio, followers modal code stays the same) ... */}

 {/* Profile Header */}
 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                    <img
                        src={users.profilePicture ? buildMediaUrl(users.profilePicture) : "https://via.placeholder.com/150"}
                        alt="profile"
                        className="w-32 h-32 rounded-full object-cover border"
                    />
                    <div className="flex-1 flex flex-col items-start">
                        {/* Username & Follow */}
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">{users.username}</h2>
                            {currentUser?.id !== id && (
                                <button
                                    className={`px-4 py-1 text-sm font-semibold border rounded-md ${isFollowing
                                        ? "bg-gray-800 text-white"
                                        : "hover:bg-gray-800"
                                        }`}
                                    onClick={handleFollow}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                            )}
                        </div>

                        {/* Counts */}
                        <div className="flex gap-6 mt-2 text-sm sm:text-base">
                            <p>
                                <span className="font-semibold">{users.posts?.length}</span> posts
                            </p>
                            <p
                                className="cursor-pointer hover:underline"
                                onClick={() => setShowFollowers(true)}
                            >
                                <span className="font-semibold">{users.followers?.length}</span>{" "}
                                followers
                            </p>
                            <p
                                className="cursor-pointer hover:underline"
                                onClick={() => setShowFollowing(true)}
                            >
                                <span className="font-semibold">{users.following?.length}</span>{" "}
                                following
                            </p>
                        </div>

                        {/* Bio */}
                        <p className="mt-2 text-gray-400 italic">
                            {users.bio || "No bio available"}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 mt-8 mb-6"></div>

                {/* ✅ Stories Section */}
                <h3 className="text-lg font-semibold mb-4">Stories</h3>
                {storiesLoading ? (
                    <p className="text-gray-400">Loading stories...</p>
                ) : stories?.length > 0 ? (
                    <div className="flex gap-4 mb-8 overflow-x-auto">
                        {stories.map((story) => (
                            <div
                                key={story._id}
                                className="flex flex-col items-center cursor-pointer"
                            >
                                <img
                                    src={story.user?.profilePicture ? buildMediaUrl(story.user.profilePicture) : "https://via.placeholder.com/80"}
                                    alt="story"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-pink-500"
                                    onClick={() => {
                                        if (stories && stories.length > 0) {
                                            setSelectedStory(stories[0]); // show first story
                                            setShowStoryModal(true);
                                        }
                                    }}
                                />
                                <span className="text-xs mt-2">{story.user?.username}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No stories yet</p>
                )}
                {/* ✅ Posts Section */}
                <h3 className="text-lg font-semibold mb-4">Posts</h3>
                {users.posts && users.posts.length > 0 ? (
                    <div className="space-y-8">
                        {users.posts.map((post) => (
                            <div key={post._id} className="border border-gray-700 rounded-lg">
                                {/* Post Header */}
                                <div className="flex items-center gap-3 p-3">
                                    <img
                                        src={users.profilePicture ? buildMediaUrl(users.profilePicture) : "https://via.placeholder.com/50"}
                                        alt="user"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <span className="font-semibold">{users.username}</span>
                                </div>

                                {/* Post Image */}
                                    {post.images && post.images.length > 0 && (
                                    <img
                                        src={buildMediaUrl(post.images[0])}
                                        alt="post"
                                        className="w-full max-h-[500px] object-cover"
                                    />
                                )}

                                {/* Post Actions */}
                                <div className="flex justify-between items-center px-3 py-2">
                                    <div className="flex gap-4 text-2xl">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className="hover:opacity-70 transition"
                                        >
                                            {likedPosts[post._id] ? (
                                                <FaHeart className="text-red-500" />
                                            ) : (
                                                <FaRegHeart />
                                            )}
                                        </button>

                                        {/* ✅ Open Comments Modal */}
                                        <button
                                            onClick={() => {
                                                setSelectedPost(post);
                                                setShowCommentModal(true);
                                            }}
                                            className="hover:opacity-70 transition"
                                        >
                                            <FaRegComment />
                                        </button>

                                        <FaRegPaperPlane />
                                    </div>
                                    <FaRegBookmark />
                                </div>

                                {/* Post Details */}
                                <div className="px-3 pb-3">
                                    <p className="font-semibold">{post.likes?.length} likes</p>
                                    <p>
                                        <span className="font-semibold">{users.username}</span>{" "}
                                        {post.caption}
                                    </p>

                                    {/* ✅ Click to view all comments */}
                                    <p
                                        className="text-sm text-gray-400 mt-1 cursor-pointer"
                                        onClick={() => {
                                            setSelectedPost(post);
                                            setShowCommentModal(true);
                                        }}
                                    >
                                        View all {post.comments?.length} comments
                                    </p>

                                    <div className="mt-2 space-y-1">
                                        {post.comments?.slice(0, 2).map((c, i) => (
                                            <p key={i} className="text-sm">
                                                <span className="font-semibold">
                                                    {c.user?.username || "User"}
                                                </span>{" "}
                                                {c.text}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No posts yet</p>
                )}
            </div>

            {/* ✅ Comment Modal */}
            {showCommentModal && selectedPost && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-[#121212] w-full max-w-2xl h-[80vh] rounded-lg overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                                <img
                                    src={
                                        users.profilePicture
                                            ? `http://${window.location.hostname === "localhost" ? "192.168.1.35" : window.location.hostname}:5000${users.profilePicture}`
                                            : "https://via.placeholder.com/40"
                                    }
                                    alt="profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="font-semibold">{users.username}</span>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCommentModal(false);
                                    setSelectedPost(null);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {selectedPost.comments?.length > 0 ? (
                                selectedPost.comments.map((c, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <img
                                            src={c.user?.profilePicture ? buildMediaUrl(c.user.profilePicture) : "https://via.placeholder.com/25"}
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
                        <div className="p-3 border-t border-gray-700 flex gap-2">
                            <input
                                type="text"
                                placeholder="Read Only comments"
                                disabled
                                className="flex-1 px-3 py-2 rounded bg-gray-800 text-gray-200 text-sm outline-none"
                            />
                            {/* <button className="text-blue-500 font-semibold">Post</button> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;

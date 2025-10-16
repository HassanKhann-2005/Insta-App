import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser, showUsers, followUser, unfollowUser } from "../app/features/auth/authSlice";

const Rightbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.app.users);
  const { currentUser } = useSelector((state) => state.app);
  const [isFollowing, setIsFollowing] = useState(false);
  // Fetch users and current user on mount
  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(showUsers());
  }, [dispatch]);

  // Logic for suggested users
  const suggestedUsers = users
    ?.filter((user) => user._id !== currentUser?.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5); // Limit to 5 suggestions

  // Dynamic check for each user
  const isUserFollowing = (targetUserId) => {
    return currentUser?.following?.includes(targetUserId);
  };

  // Handle follow/unfollow
  const handleFollowClick = (targetUserId) => {
    if (!currentUser) return;

    if (isUserFollowing(targetUserId)) {
      dispatch(unfollowUser({ currentUserId: currentUser.id, targetUserId }));
    } else {
      dispatch(followUser({ currentUserId: currentUser.id, targetUserId }));
    }
  };


  if (loading) return <div className="text-gray-400 text-sm">Loading...</div>;
  if (error) return <div className="text-red-500 text-sm">Error: {error}</div>;

return (
  <div className="hidden xl:block w-[320px] shrink-0 ml-auto pr-0">
      <div className="sticky top-4 space-y-4">
        {/* Current user section */}
        <div className="flex items-center justify-between bg-[#121212] border border-gray-800 rounded-lg p-3"
        onClick={() => navigate(`/userprofile/${currentUser?.id}`)}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-[2px]">
              <img
                src={
                  currentUser?.profilePicture
                    ? `http://localhost:5000${currentUser.profilePicture}`
                    : "https://via.placeholder.com/64"
                }
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold cursor-default">{currentUser?.username || "User"}</p>
              <p className="text-xs text-gray-500 cursor-default">{currentUser?.name || "Name"}</p>
            </div>
          </div>
          <button className="text-blue-400 text-xs font-semibold hover:text-blue-300">Switch</button>
        </div>
        {/* Suggested users section */}
        <div className="bg-[#121212] border border-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-400">Suggested for you</p>
            <button className="text-white text-xs font-semibold hover:underline">See All</button>
          </div>
          <div className="space-y-3">
            {suggestedUsers?.length > 0 ? (
              suggestedUsers.map((user) => {
                // const isFollowing = currentUser?.following?.includes(user._id);
                return (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center"
                      onClick={() => navigate(`/userprofile/${user?._id}`)}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-[2px]"
                     
                      >
                        <img
                          src={
                            user.profilePicture
                              ? `http://localhost:5000${user.profilePicture}`
                              : "https://via.placeholder.com/64"
                          }
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                         
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm cursor-default">{user.username}</p>
                        <p className="text-xs text-gray-500 cursor-default">Suggested for you</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollowClick(user._id)}
                      className={`text-xs font-semibold ${isUserFollowing(user._id)
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-400 hover:text-blue-300"
                        }`}
                    >
                      {isUserFollowing(user._id) ? "Following" : "Follow"}
                    </button>


                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500">No suggestions available</p>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="text-[11px] text-gray-500 leading-5">
          <p>About • Help • Press • API • Jobs • Privacy • Terms</p>
          <p>Locations • Language • Meta Verified</p>
          <p className="mt-2">© {new Date().getFullYear()} INSTAGRAM FROM META</p>
        </div>
      </div>
    </div>
  );
};

export default Rightbar;
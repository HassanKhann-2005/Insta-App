import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser, showUsers } from "../../app/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import Posts from "../../components/Posts";
import Rightbar from "../../components/Rightbar";
import BottomNav from "../../components/BottomNav";
import { fetchPosts } from "../../app/features/posts/postSlice";
import { fetchStories, viewStory } from "../../app/features/stories/storiesSlice";
import { fetchNotifications } from "../../app/features/notifications/notificationSlice";
import Stories from "../../components/Stories/Stories";
import ViewStory from "../../components/ViewStory/ViewStory";
import { getUserChats } from "../../app/features/messages/messageSlice";


const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loading, error } = useSelector((state) => state.app.users);
  const { currentUser } = useSelector((state) => state.app);
  const { posts } = useSelector((state) => state.posts)
  const { stories } = useSelector((state) => state.stories)
  const {notifications} = useSelector((state) => state.notifications)
  const{chats} = useSelector((state) => state.messages)


  const [selectedStory, setSelectedStory] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Fetch users and current user on mount
  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(showUsers());
  }, [dispatch]);

  // Remove legacy full fetch to avoid conflict with paginated getPosts
  // useEffect(() => {
  //   dispatch(fetchPosts());
  // }, [dispatch]);

  useEffect(() => {
    dispatch(fetchStories());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getUserChats(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  console.log("User chats: ",chats);
  

  console.log("STORIES FROM HOME", stories);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  
  

  // console.log("Notifications", notifications);
  // console.log("ALL POSTS", posts);
  // console.log("All Users", users);
  // console.log("ALL STORIES", stories);

  

  // inside Home component
const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

const handleStoryClick = (userId) => {
  const userStories = stories.filter((story) => story.user._id === userId);
  if (userStories.length > 0) {
    setSelectedStory({ user: userStories[0].user, stories: userStories });
    setSelectedStoryIndex(0);
    setShowStoryModal(true);

    // ✅ Mark viewed only if not currentUser's own story
    if (userId !== currentUser.id) {
      dispatch(viewStory({ storyId: userStories[0]._id, userId: currentUser.id }));
    }
  }
};

const handleCloseStory = () => {
  setShowStoryModal(false);
  setSelectedStory(null);
  setSelectedStoryIndex(0);
  setShowInfo(false);
};

const handleNextStory = () => {
  if (selectedStory && selectedStoryIndex < selectedStory.stories.length - 1) {
    const newIndex = selectedStoryIndex + 1;
    setSelectedStoryIndex(newIndex);

    // ✅ Dispatch view action for next story
    const nextStory = selectedStory.stories[newIndex];
    if (selectedStory.user._id !== currentUser.id) {
      dispatch(viewStory({ storyId: nextStory._id, userId: currentUser.id }));
    }
  } else {
    handleCloseStory();
  }
};

const handlePrevStory = () => {
  if (selectedStory && selectedStoryIndex > 0) {
    setSelectedStoryIndex(selectedStoryIndex - 1);
  }
};



  // Local loading UI is replaced by GlobalLoader overlay

  // Keep page render; show errors inline if needed later

  // Filter out current user and shuffle suggested accounts



  return (
    <div className="flex bg-black text-white font-sans min-h-screen">
      {/* Left Sidebar */}
      <Topbar />
  
      {/* Main Content */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[1400px] px-2 sm:px-4 lg:px-8 py-4 flex gap-0 lg:gap-8">
          
          {/* Feed (Center Column) */}
          <div className="flex-1 max-w-full sm:max-w-[600px] mx-auto">
            {/* Stories */}
            <Stories users={users} onStoryClick={handleStoryClick} />
  
            {/* Posts */}
            <Posts />
          </div>
  
          {/* Right Sidebar */}
          <div className="hidden lg:block w-[350px]">
            <Rightbar />
          </div>
        </div>
      </div>
  
      {/* Messages bubble (bottom-right) */}
      <div className="hidden lg:flex fixed bottom-6 right-6 bg-[#121212] border border-gray-800 rounded-full px-3 py-2 items-center gap-2 shadow-lg cursor-default"
       onClick={() => navigate("/messages")}
      >
        <span className="text-sm text-gray-200">Messages</span>
        <div className="flex -space-x-2">
  {loading ? (
    // ✅ show skeleton loaders while fetching chats
    [...Array(3)].map((_, i) => (
      <div
        key={i}
        className="w-6 h-6 rounded-full border-2 border-[#121212] bg-gray-700 animate-pulse"
      ></div>
    ))
  ) : chats.length > 0 ? (
    chats.slice(-3).map((msg, index) => (
      <img
        key={index}
        src={`http://localhost:5000${msg.otherUserPic}`}
        alt={msg.otherUserName || "User"}
        className="w-6 h-6 rounded-full border-2 border-[#121212] object-cover cursor-default"
       
      />
    ))
  ) : (
    // ✅ fallback if no chats
    <span className="text-gray-400 text-xs">No chats yet</span>
  )}
</div>


      </div>
  
      {/* Mobile bottom navigation */}
      <BottomNav />

      {/* View Story Modal */}
      {showStoryModal && selectedStory && (
        <ViewStory
          selectedStory={selectedStory}
          selectedStoryIndex={selectedStoryIndex}
          handleCloseStory={handleCloseStory}
          handlePrevStory={handlePrevStory}
          handleNextStory={handleNextStory}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          currentUser={currentUser}
        />
      )}
    </div>
  );
  
};

export default Home;
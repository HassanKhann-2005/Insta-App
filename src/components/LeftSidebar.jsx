import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSearch,
  faCompass,
  faVideo,
  faPaperPlane,
  faHeart,
  faPlusSquare,
  faUser,
  faCircle,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../app/features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { currentUser, loading, error } = useSelector((state) => state.app);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Handle loading state
  if (loading) {
    return (
      <div className="h-screen w-64 bg-black text-white flex flex-col border-r border-gray-800 items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="h-screen w-64 bg-black text-white flex flex-col border-r border-gray-800 items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-64 bg-black text-white flex flex-col border-r border-gray-800 sticky top-0">
      {/* Logo */}
      <div className="px-6 py-6 text-2xl font-lobster">Instagram</div>
      {/* Nav Items */}
      <nav className="flex-1 space-y-2 px-3">
        <SidebarItem icon={faHome} label="Home" active />
        <SidebarItem icon={faSearch} label="Search" />
        <SidebarItem icon={faCompass} label="Explore" />
        <SidebarItem icon={faVideo} label="Reels" />
        <SidebarItem icon={faPaperPlane} label="Messages" />
        <SidebarItem icon={faHeart} label="Notifications" />
        <SidebarItem 
        icon={faPlusSquare}
         label="Create"
         onClick={() => navigate("/createposts")}
         />
        <SidebarItem
          icon={faUser}
          label="Profile"
          avatar
          profilePicture={currentUser?.profilePicture}
          onClick={() => navigate("/profile")}
        />
        <SidebarItem icon={faCircle} label="Meta AI" />
        <SidebarItem icon={faMessage} label="AI Studio" />
        <SidebarItem icon={faCircle} label="Threads" />
      </nav>
    </div>
  );
};

// Sidebar item component
const SidebarItem = ({ icon, label, active, badge, avatar, profilePicture, onClick }) => {
  const baseUrl = "http://localhost:5000"; // Adjust if your backend uses a different port

  return (
    <div
      className={`flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition hover:bg-gray-900 ${
        active ? "font-semibold" : "font-normal"
      }`}
      onClick={onClick}
    >
      {avatar ? (
        <img
          src={
            profilePicture
              ? `http://localhost:5000${currentUser.profilePicture}`
              : "https://via.placeholder.com/30"
          }
          alt="profile"
          className="w-7 h-7 rounded-full object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/30"; // Fallback on error
          }}
        />
      ) : (
        <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      )}
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
};

export default Sidebar;
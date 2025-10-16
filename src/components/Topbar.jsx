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
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { buildMediaUrl } from "../constants/api";
import { fetchNotifications } from "../app/features/notifications/notificationSlice";
import { getUserChats } from "../app/features/messages/messageSlice";

const Topbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const { currentUser } = useSelector((state) => state.app);
  const { notifications } = useSelector((state) => state.notifications);
  const { chats } = useSelector((state) => state.messages);

  useEffect(() => {
    if (!currentUser?.id) return;
    dispatch(fetchNotifications());
    dispatch(getUserChats(currentUser.id));
  }, [dispatch, currentUser?.id])

  console.log("Notifications in Topbar:", notifications);
  console.log("Chats in Topbar:", chats);



  return (
    <div className="hidden md:flex h-screen w-60 bg-black text-white flex-col border-r border-gray-800 sticky top-0">
      <div className="px-6 py-6 text-2xl font-lobster">Instagram</div>
      <nav className="flex-1 space-y-1 px-3">
        <SidebarItem icon={faHome} label="Home" active />
        <SidebarItem icon={faSearch} label="Search" />
        <SidebarItem icon={faCompass} label="Explore" />
        <SidebarItem icon={faVideo} label="Reels" />
        <SidebarItem
          icon={faPaperPlane}
          label="Messages"
          badge={Array.isArray(chats) ? chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0) : 0}
          onClick={() => navigate("/messages")}
        />


        <SidebarItem icon={faHeart} label="Notifications"
          onClick={() => navigate("/notifications")}
          badge={notifications.filter(notif => !notif.isRead).length}
        />
        <SidebarItem
          icon={faPlusSquare}
          label="Create"
          onClick={() => navigate("/createposts")} />
        <SidebarItem
          icon={faUser}
          label="Profile"
          avatar
          onClick={() => navigate("/profile")}
          avatarUrl={
          currentUser?.profilePicture
            ? buildMediaUrl(currentUser.profilePicture)
            : "https://via.placeholder.com/30"
        }
        />
        <SidebarItem icon={faCircle} label="Meta AI" />
        <SidebarItem icon={faMessage} label="AI Studio" />
        <SidebarItem icon={faCircle} label="Threads" />
      </nav>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, badge, avatar, onClick, avatarUrl }) => (
  <div
    className={`flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition hover:bg-gray-900 ${active ? "font-semibold" : "font-normal"
      }`}
    onClick={onClick}
  >
    {avatar ? (
      <img
        src={avatarUrl || "https://via.placeholder.com/30"}
        alt="profile"
        className="w-7 h-7 rounded-full"
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

export default Topbar;



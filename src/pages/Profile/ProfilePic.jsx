import React, { useState, useEffect, useRef } from "react";
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
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCurrentUser,
  uploadProfilePicture,
  followData,
  updateUserBio,
} from "../../app/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { buildMediaUrl } from "../../constants/api";
import { fetchPosts } from "../../app/features/posts/postSlice";

/* Sidebar Item Component */
const SidebarItem = ({ icon, label, active, badge, avatar, avatarUrl, onClick }) => (
  <div
    className={`flex items-center gap-4 px-3 py-2 rounded-lg cursor-pointer transition hover:bg-gray-900 ${
      active ? "font-semibold" : "font-normal"
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

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, loading, error,followers,following} = useSelector((state) => state.app);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const {posts} = useSelector((state) => state.posts);
  const [bio, setBio] = useState("");

 //Modal state

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("followers"); // or "following"


  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // Fetch current user
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Fetch follow data when currentUser is loaded
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(followData(currentUser.id));
    }
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (currentUser?.bio !== undefined) {
      setBio(currentUser.bio || "");
    }
  }, [currentUser?.bio]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return;
    const formData = new FormData();
    formData.append("profilePicture", selectedFile);
    try {
      await dispatch(uploadProfilePicture({ userId: currentUser.id, formData })).unwrap();
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // 🛑 Guard while loading
  if (loading && !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-white bg-black">
        Loading profile...
      </div>
    );
  }

  

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchPosts(currentUser.id));
    }
  }, [dispatch, currentUser?.id])
  
console.log("Posts",posts);

  return (
    <div className="flex bg-black text-white font-sans min-h-screen">
      {/* Left Sidebar */}
      <div className="hidden md:flex h-screen w-60 bg-black text-white flex-col border-r border-gray-800 sticky top-0">
        <div className="px-6 py-6 text-2xl font-lobster">Instagram</div>
        <nav className="flex-1 space-y-1 px-3">
          <SidebarItem icon={faHome} label="Home" onClick={() => navigate("/")} />
          <SidebarItem icon={faSearch} label="Search" />
          <SidebarItem icon={faCompass} label="Explore" />
          <SidebarItem icon={faVideo} label="Reels" />
          <SidebarItem icon={faPaperPlane} label="Messages"
           onClick={() => navigate("/messages")}
          />
          {/* <SidebarItem icon={faHeart} label="Notifications" /> */}
          <SidebarItem icon={faPlusSquare} label="Create"
           onClick={() => navigate("/createposts")}
          />
          <SidebarItem
            icon={faUser}
            label="Profile"
            avatar
            avatarUrl={
              currentUser?.profilePicture
                ? buildMediaUrl(currentUser.profilePicture)
                : "https://via.placeholder.com/30"
            }
            onClick={() => navigate("/profile")}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[800px] mx-auto px-4 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-[#121212] rounded-xl border border-gray-800 p-8 mb-6">
            <div className="flex items-center space-x-6 md:space-x-8">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-[3px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full rounded-full object-cover" />
                    ) : currentUser?.profilePicture ? (
                      <img
                      src={buildMediaUrl(currentUser.profilePicture)} 
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={openFileDialog}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faCamera} className="w-4 h-4 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold mb-2">{currentUser?.username || "Username"}</h1>
                <p className="text-gray-400 mb-4">{currentUser?.email || "email@example.com"}</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={150}
                    rows={3}
                    placeholder="Tell something about yourself..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">{bio.length}/150</div>
                  <button
                    onClick={async () => {
                      if (!currentUser?.id) return;
                      try {
                        await dispatch(updateUserBio({ userId: currentUser.id, bio })).unwrap();
                      } catch (err) {
                        console.error('Failed to update bio', err);
                      }
                    }}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Save Bio
                  </button>
                </div>

                {selectedFile && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300">Selected: {selectedFile.name}</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Uploading..." : "Upload Picture"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </div>
          </div>

           {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[800px] mx-auto px-4 lg:px-8 py-8">

          {/* Profile Stats */}
          <div className="bg-[#121212] rounded-xl border border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="grid grid-cols-3 gap-4 text-center md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{currentUser?.posts?.length || 0}</div>
                <div className="text-gray-400">Posts</div>
              </div>
              <div
                className="text-center cursor-pointer hover:text-blue-400"
                onClick={() => openModal("followers")}
              >
                <div className="text-2xl font-bold">{followers.length || 0}</div>
                <div className="text-gray-400">Followers</div>
              </div>
              <div
                className="text-center cursor-pointer hover:text-blue-400"
                onClick={() => openModal("following")}
              >
                <div className="text-2xl font-bold">{following.length || 0}</div>
                <div className="text-gray-400">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
    <div className="bg-gray-800 w-full max-w-md rounded-xl shadow-2xl p-6 transform transition-all duration-300 ease-in-out hover:shadow-blue-500/50">
      <h3 className="text-xl font-semibold mb-5 text-blue-300 border-b border-gray-700 pb-2">
        {modalType === "followers" ? "Followers" : "Following"}
      </h3>
      <ul className="max-h-80 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {(modalType === "followers" ? followers : following)?.map((user) => (
          <li key={user._id} className="flex items-center gap-4 p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          onClick={() => navigate(`/userprofile/${user?._id}`)}
          >
            <img
              src={user.profilePicture ? buildMediaUrl(user.profilePicture) : "https://via.placeholder.com/40"}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
            />
            <span className="text-sm font-medium text-gray-200 cursor-default" >{user.username || user.name}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={closeModal}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        Close
      </button>
    </div>
  </div>
)}
       {/* ✅ Account Settings Restored */}
<div className="bg-[#121212] rounded-xl border border-gray-800 p-6">
  <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
      <input
        type="text"
        value={currentUser?.username || ""}
        disabled
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
      <input
        type="email"
        value={currentUser?.email || ""}
        disabled
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
      />
    </div>
  </div>
</div>

{/* ✅ User Uploaded Posts */}
<div className="bg-[#121212] rounded-xl border border-gray-800 p-7 mt-6 ">
  <h2 className="text-xl font-semibold mb-4">Your Uploaded Posts</h2>

  {posts?.filter((post) => post.user?._id === currentUser?.id).length === 0 ? (
    <p className="text-gray-400 text-center">No posts uploaded yet.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
      {posts
        .filter((post) => post.user?._id === currentUser?.id)
        .map((post) => (
          <div
            key={post._id}
            className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900"
          >
            <img
             src={buildMediaUrl(post.images[0])} 
              alt="user post"
              className="w-full h-40 object-cover"
            />
            <div className="p-2 text-sm text-gray-300 truncate">
              {post.caption || "No caption"}
            </div>
          </div>
        ))}
    </div>
  )}
</div>

    </div>
    </div>
    </div>
   

  );
};

export default Profile;

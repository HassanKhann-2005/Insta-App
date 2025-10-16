import React, { useEffect, useState, useRef } from "react";
import { FaSearch, FaPaperPlane, FaSmile } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { FaVideo } from "react-icons/fa";
import Picker from 'emoji-picker-react';
import { useDispatch, useSelector } from "react-redux";
import {
  getUserChats,
  sendMessage,
  getConversation,
  markConversationAsRead,
} from "../../app/features/messages/messageSlice";
import { socket } from "../../socketConnection/socket";
import { fetchCurrentUser, showUsers } from "../../app/features/auth/authSlice";
import { buildMediaUrl } from "../../constants/api";


export default function Messages({ currentUserId }) {
  const dispatch = useDispatch();
  const {chats,loading,error,conversations} = useSelector((state) => state.messages);
  

  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [modalMediaSrc, setModalMediaSrc] = useState(null);
  const [modalMediaType, setModalMediaType] = useState(null); // 'image' | 'video'

  // ✅ FIX: correctly select users
  const { users } = useSelector((state) => state.app.users);
  const {currentUser} = useSelector((state) => state.app);

  // Load all users
  useEffect(() => {
    dispatch(showUsers());
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  console.log("Users from state:", users);

  // Load chats of logged-in user
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(getUserChats(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  // Load conversation when switching user/chat
  useEffect(() => {
    if (currentUser?.id && activeChat) {
      dispatch(
        getConversation({
          userId: currentUser.id,
          otherUserId: activeChat._id,
        })
      );
      // mark messages from that user as read
      dispatch(markConversationAsRead({ userId: currentUser.id, otherUserId: activeChat._id }));
    }
  }, [activeChat, currentUser?.id, dispatch]);



  // Socket listener
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (msg.sender === activeChat?._id || msg.receiver === activeChat?._id) {
        dispatch(
          getConversation({
            userId: currentUser.id,       // FIXED
            otherUserId: activeChat._id,   // FIXED
          })
        );
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [dispatch, activeChat, currentUser?.id]);

  // Send message
  const handleSend = () => {
    if ((!newMessage.trim() && !imageFile && !videoFile) || !activeChat) return;

    const msgData = {
      senderId: currentUser.id,
      receiverId: activeChat._id,
      content: newMessage,
      mediaFile: videoFile || imageFile,
    };

    dispatch(sendMessage(msgData)).then((action) => {
      // emit saved payload if available
      const saved = action?.payload?.data || action?.payload;
      if (saved) {
        socket.emit("sendMessage", saved);
      }
    });

    setNewMessage("");
    setImageFile(null);
    setImagePreview(null);
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePickVideo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + (emojiData.emoji || ""));
    setShowEmojiPicker(false);
  };

  // Lightbox helpers
  const openMediaModal = (type, src) => {
    setModalMediaType(type);
    setModalMediaSrc(src);
    setShowMediaModal(true);
  };
  const closeMediaModal = () => {
    setShowMediaModal(false);
    setModalMediaSrc(null);
    setModalMediaType(null);
  };
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeMediaModal(); };
    if (showMediaModal) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showMediaModal]);

  // Conversation messages
  const messages =
    activeChat && conversations[activeChat._id]
      ? conversations[activeChat._id]
      : [];

  // Auto-scroll to bottom on chat open / new messages
  const messagesEndRef = useRef(null);
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  };
  useEffect(() => {
    // when switching chats, jump immediately
    scrollToBottom(false);
  }, [activeChat?._id]);
  useEffect(() => {
    // when messages update, smooth scroll
    if (messages.length) scrollToBottom(true);
  }, [messages.length]);

      if (!currentUser) {
        return (
          <div className="flex items-center justify-center h-screen text-gray-400">
            Loading user...
          </div>
        );
      }

  return (
    <div className="flex bg-black text-white min-h-screen">
      {/* Sidebar */}
      <div className={`border-r border-gray-800 flex flex-col ${activeChat ? "hidden md:flex md:w-1/3" : "w-full md:w-1/3"}`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-black z-10">
          <h1 className="text-xl font-semibold">Messages</h1>
          <FaPaperPlane className="text-gray-400 text-lg cursor-pointer" />
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-gray-900 text-white outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="overflow-y-auto flex-1">
          {loading && <p className="p-3 text-gray-400">Loading...</p>}

          {Array.isArray(users) &&
            users.map((user) =>
              user._id !== currentUser.id ? (
                <div
                  key={user._id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-900 ${
                    activeChat?._id === user._id ? "bg-gray-900" : ""
                  }`}
                  onClick={() => setActiveChat(user)}
                >
                  <img
                   src={buildMediaUrl(user.profilePicture)}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold">{user.username}</h2>
                    <p className="text-xs text-gray-400">Tap to chat</p>
                  </div>
                </div>
              ) : null
            )}
        </div>
      </div>

      {/* Chat Box */}
      <div className={`${activeChat ? "flex" : "hidden md:flex"} w-full md:w-2/3 flex-col min-h-screen`}>        
        {activeChat ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-800 sticky top-0 bg-black z-10">
              <button
                className="md:hidden mr-2 text-gray-300 px-2 py-1 rounded border border-gray-700"
                onClick={() => setActiveChat(null)}
              >
                Back
              </button>
              <img
               src={buildMediaUrl(activeChat.profilePicture)}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold">{activeChat.username}</h2>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.senderId === currentUser.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                      msg.senderId === currentUser.id
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-800 text-white rounded-bl-none"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={buildMediaUrl(msg.image)}
                        alt="attachment"
                        className="mb-2 max-w-[250px] rounded cursor-zoom-in"
                        onClick={() => openMediaModal('image', buildMediaUrl(msg.image))}
                      />
                    )}
                    {msg.video && (
                      <video controls className="mb-2 max-w-[250px] rounded cursor-zoom-in"
                        onClick={() => openMediaModal('video', buildMediaUrl(msg.video))}>
                        <source src={buildMediaUrl(msg.video)} />
                      </video>
                    )}
                    {msg.content && !(msg.content === "Sent an attachment" && (msg.image || msg.video)) && (
                      <p>{msg.content}</p>
                    )}
                    <span className="text-[10px] opacity-70 block text-right text-gray-300">
                      {msg.createdAt &&
                        new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="p-3 border-t border-gray-800 flex items-center gap-2 bg-black sticky bottom-0 z-10 w-full"
              style={{
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingLeft: "env(safe-area-inset-left)",
                paddingRight: "env(safe-area-inset-right)",
              }}
            >
              <label className="text-gray-400 cursor-pointer text-lg">
                <FiImage />
                <input type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
              </label>
              <label className="text-gray-400 cursor-pointer text-lg">
                <FaVideo />
                <input type="file" accept="video/*" className="hidden" onChange={handlePickVideo} />
              </label>
              <div className="relative">
                <FaSmile className="text-gray-400 cursor-pointer text-lg" onClick={() => setShowEmojiPicker((s) => !s)} />
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 z-50">
                    <div className="relative">
                      <button
                        aria-label="Close emoji picker"
                        onClick={() => setShowEmojiPicker(false)}
                        className="absolute -top-1 -right-6 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-gray-700"
                      >
                        ×
                      </button>
                      <Picker onEmojiClick={onEmojiClick} theme="dark" width={320} height={420} />
                    </div>
                  </div>
                )}
              </div>
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="w-10 h-10 rounded object-cover" />
              )}
              {videoPreview && (
                <video src={videoPreview} className="w-12 h-12 rounded object-cover" />
              )}
              <input
                type="text"
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 min-w-0 px-4 py-3 bg-gray-900 rounded-full outline-none text-white placeholder-gray-500"
              />
              <button
                onClick={handleSend}
                className="shrink-0 bg-blue-600 text-white px-3 py-2 rounded-full font-medium hover:bg-blue-700 text-sm md:px-4 md:py-2"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 p-6 text-center">
            <div>
              <h2 className="text-lg font-semibold mb-2">Your messages</h2>
              <p className="text-sm text-gray-400">Select a user from the list to start a conversation.</p>
            </div>
          </div>
        )}
      </div>
      {showMediaModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center" onClick={closeMediaModal}>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close"
              onClick={closeMediaModal}
              className="absolute -top-3 -right-3 bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            {modalMediaType === 'image' && (
              <img src={modalMediaSrc} alt="media" className="max-w-[90vw] max-h-[90vh] object-contain" />
            )}
            {modalMediaType === 'video' && (
              <video src={modalMediaSrc} controls className="max-w-[90vw] max-h-[90vh]" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

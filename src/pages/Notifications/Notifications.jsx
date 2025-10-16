import React, { useEffect } from "react";
import { fetchNotifications, markAllAsRead } from "../../app/features/notifications/notificationSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../../app/features/auth/authSlice";
import { buildMediaUrl } from "../../constants/api";

const Notifications = () => {
    const { notifications, loading, error } = useSelector(
        (state) => state.notifications
    );

    const { currentUser } = useSelector((state) => state.app);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchNotifications());
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    const handleMarkAll = () => {
        dispatch(markAllAsRead());
    };



    console.log("Notifications from Redux:", notifications);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-6">
            <h2 className="text-2xl font-bold mb-6 tracking-wide">Notifications</h2>

            <div className="w-full max-w-md px-4">
                {loading ? (
                    <p className="text-center text-gray-400 py-10">Loading...</p>
                ) : error ? (
                    <p className="text-center text-red-500 py-10">
                        {error.message || "Failed to load notifications"}
                    </p>
                ) : notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-10 text-lg">
                        🚫 No notifications yet
                    </p>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={handleMarkAll}
                            className="mb-4 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Mark All as Read
                        </button>
                        {notifications.map((notif) => (

                            <div
                                key={notif._id || notif.id}

                                onClick={() => {
                                    navigate(`/userprofile/${currentUser.id}`);

                                }}
                                // support both backend + sample data

                                className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg transition ${notif.isRead
                                    ? "bg-neutral-900"
                                    : "bg-neutral-800 border border-gray-700"
                                    } hover:bg-neutral-700`}
                            >

                                <img
                                    src={
                                        notif.sender?.profilePicture
                                            ? buildMediaUrl(notif.sender.profilePicture)
                                            : "https://via.placeholder.com/48"
                                    }
                                    alt="profile"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                                />
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-semibold">
                                            {notif.sender?.username || "Unknown"}
                                        </span>{" "}
                                        {notif.type === "like" && (
                                            <span className="text-pink-400">liked your post ❤️</span>
                                        )}
                                        {notif.type === "comment" && (
                                            <span className="text-blue-400">
                                                commented on your post 💬
                                            </span>
                                        )}
                                        {notif.type === "follow" && (
                                            <span className="text-green-400">
                                                started following you ✅
                                            </span>
                                        )}
                                        {notif.type === "message" && notif.message?.content && (
                                            <span className="text-gray-300">
                                                sent:{" "}
                                                {notif.message.content.length > 30
                                                    ? notif.message.content.substring(0, 30) + "..."
                                                    : notif.message.content}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {notif.createdAt
                                            ? new Date(notif.createdAt).toLocaleString()
                                            : ""}
                                    </p>
                                </div>
                                {!notif.isRead && (
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;

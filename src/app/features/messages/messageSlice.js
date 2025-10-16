import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../../../constants/api";
import { API_BASE_URL } from "../../../constants/api";

// ✅ Send message (via REST for persistence)
export const sendMessage = createAsyncThunk(
    "messages/sendMessage",
    async ({ senderId, receiverId, content, imageFile, mediaFile }, { rejectWithValue }) => {
        try {
            debugger
            let res;
            const file = mediaFile || imageFile;
            if (file) {
                const formData = new FormData();
                formData.append("senderId", senderId);
                formData.append("receiverId", receiverId);
                if (content) formData.append("content", content);
                const isVideo = file.type?.startsWith("video/");
                formData.append(isVideo ? "video" : "image", file);
                res = await apiClient.post(`/messages/sendmessage`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                res = await apiClient.post(`/messages/sendmessage`, {
                    senderId,
                    receiverId,
                    content,
                });
            }
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ✅ Get conversation between two users
export const getConversation = createAsyncThunk(
    "messages/getConversation",
    async ({ userId, otherUserId }, { rejectWithValue }) => {
        try {
            const res = await apiClient.get(
                `/messages/conversation/${userId}/${otherUserId}`
            );
            return { otherUserId, messages: res.data.messages };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Mark conversation as read
export const markConversationAsRead = createAsyncThunk(
    "messages/markAsRead",
    async ({ userId, otherUserId }, { rejectWithValue }) => {
        try {
            const res = await apiClient.put(`/messages/conversation/${userId}/${otherUserId}/read`);
            return { otherUserId, result: res.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ✅ Get all chats for a user (last messages only)
export const getUserChats = createAsyncThunk(
    "messages/getUserChats",
    async (userId, { rejectWithValue }) => {
        try {
            const res = await apiClient.get(`/messages/chats/${userId}`);
            return res.data.chats;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);




const messageSlice = createSlice({
    name: "messages",
    initialState: {
        chats: {}, // {userId: [messages]}
        conversations: {},
        loading: false,
        error: null,
    },
    reducers: {
        addSocketMessage: (state, action) => {
            const { sender, message } = action.payload;
            if (!state.chats[sender]) state.chats[sender] = [];
            state.chats[sender].push(message);
        },
    },
    extraReducers: (builder) => {
        builder

        .addCase(sendMessage.fulfilled, (state, action) => {
            const msg = action.payload.data || action.payload; // backend sends {message, data: {...}}
            const otherUserId = msg.receiverId;
          
            if (!state.conversations[otherUserId]) {
              state.conversations[otherUserId] = [];
            }
          
            state.conversations[otherUserId].push(msg);
          })
          

            // 🔹 Get conversation
            .addCase(getConversation.pending, (state) => {
                state.loading = true;
            })
            .addCase(getConversation.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations[action.payload.otherUserId] =
                action.payload.messages;
            })
            .addCase(getConversation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // 🔹 Get user chats
            .addCase(getUserChats.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserChats.fulfilled, (state, action) => {
                state.loading = false;
                state.chats = action.payload;
            })
            .addCase(getUserChats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(markConversationAsRead.fulfilled, (state, action) => {
                const otherUserId = action.payload.otherUserId;
                // clear unread for that chat if chats is an array of objects
                if (Array.isArray(state.chats)) {
                    const idx = state.chats.findIndex(c => c._id === otherUserId);
                    if (idx !== -1) {
                        state.chats[idx].unreadCount = 0;
                    }
                }
            });

    },
});

export const { addSocketMessage } = messageSlice.actions;
export default messageSlice.reducer;

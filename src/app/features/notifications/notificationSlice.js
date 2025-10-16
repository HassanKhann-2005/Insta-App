import { createAsyncThunk } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../../constants/api";


export const fetchNotifications = createAsyncThunk(
    "notifications/fetchNotifications",
    async (_, { rejectWithValue }) => {
      try {
        
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/notifications/getNotifications`,   // ✅ correct route
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: "Error fetching notifications" });
      }
    }
  );

  // ✅ Thunk for marking all notifications as read

export const markAllAsRead = createAsyncThunk(
    "notifications/markAllAsRead",
    async (_, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `${API_BASE_URL}/notifications/read-all`,
          {}, // empty body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to mark as read");
      }
    }
  );
  


const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        notifications: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearNotifications: (state) => {
            state.notifications = [];
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message || "Failed to fetch notifications";
            })

            .addCase(markAllAsRead.pending, (state) => {
                state.loading = true;
              })
              .addCase(markAllAsRead.fulfilled, (state) => {
                state.loading = false;
                state.notifications = state.notifications.map((notif) => ({
                  ...notif,
                  isRead: true,
                }));
              })
              .addCase(markAllAsRead.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
              });
    },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
  
// src/redux/profilepicSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../../constants/api";

// Async thunk for uploading profile picture
export const uploadProfilePic = createAsyncThunk(
  "profilePic/upload",
  async ({ userId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.post(
        `${API_BASE_URL}/${userId}/upload-profile-pic`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data; // returns updated user with profilePicture URL
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload profile picture"
      );
    }
  }
);

const profilePicSlice = createSlice({
  name: "profilePic",
  initialState: {
    profilePicUrl: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadProfilePic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePic.fulfilled, (state, action) => {
        state.loading = false;
        state.profilePicUrl = action.payload.profilePicture; // assuming backend sends profilePicture URL
      })
      .addCase(uploadProfilePic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default profilePicSlice.reducer;

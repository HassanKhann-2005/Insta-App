import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../../constants/api";

// ================= THUNKS =================

// ✅ Fetch all active stories
export const fetchStories = createAsyncThunk(
    "stories/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/stories/getstories`);
            return response.data; // array of stories
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error || "Failed to fetch stories"
            );
        }
    }
);

// ✅ Upload a new story
export const uploadStory = createAsyncThunk(
    "stories/upload",
    async ({ userId, file }, { rejectWithValue }) => {
        try {
            debugger
            const formData = new FormData();
            formData.append("media", file);

            const response = await axios.post(
                `${API_BASE_URL}/stories/${userId}/uploadstory`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data.story; // returns the created story
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error || "Failed to upload story"
            );
        }
    }
);

// ✅ Mark story as viewed
export const viewStory = createAsyncThunk(
    "stories/view",
    async ({ storyId, userId }, { rejectWithValue }) => {
        try {
            debugger
            const response = await axios.put(
                `${API_BASE_URL}/stories/${storyId}/viewstory`,
                { userId }
            );
            return response.data; // updated story with viewers
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to mark story as viewed"
            );
        }
    }
);

// Fetch all stories for a specific user
export const fetchUserStories = createAsyncThunk(
    "stories/fetchUserStories",
    async (userId, { rejectWithValue }) => {
      try {
        debugger
        const response = await axios.get(`${API_BASE_URL}/stories/${userId}/getstory`);
        return response.data; // ✅ array of stories
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch user stories"
        );
      }
    }
  );



// ================= SLICE =================
const storiesSlice = createSlice({
    name: "stories",
    initialState: {
        stories: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        // --- Fetch Stories ---
        builder.addCase(fetchStories.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchStories.fulfilled, (state, action) => {
            state.loading = false;
            state.stories = action.payload;
        });
        builder.addCase(fetchStories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // --- Upload Story ---
        builder.addCase(uploadStory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(uploadStory.fulfilled, (state, action) => {
            state.loading = false;
            // add new story to the beginning (like Instagram)
            state.stories.unshift(action.payload);
        });
        builder.addCase(uploadStory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
            .addCase(viewStory.fulfilled, (state, action) => {
                const updatedStory = action.payload;
                const index = state.stories.findIndex((s) => s._id === updatedStory._id);
                if (index !== -1) {
                    state.stories[index] = updatedStory; // update with viewers
                }
            })
            .addCase(fetchUserStories.pending, (state) => {
                state.loading = true;
                state.error = null;
              })
              .addCase(fetchUserStories.fulfilled, (state, action) => {
                state.loading = false;
                state.stories = action.payload; // ✅ will now only store that user’s stories
              })
              .addCase(fetchUserStories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
              });
    },
});

export default storiesSlice.reducer;

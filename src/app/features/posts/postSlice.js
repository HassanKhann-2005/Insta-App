import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL, apiClient } from "../../../constants/api";
// ================== ASYNC THUNKS ==================

// Create a post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async ({ userId, caption, images }, { rejectWithValue }) => {
    try {
      debugger
      const formData = new FormData();
      formData.append("caption", caption);

      images.forEach((img) => {
        formData.append("images", img);
      });

      const res = await fetch(
        `${API_BASE_URL}/posts/createPosts/${userId}`,
        {
          method: "POST",
          body: formData, // fetch auto sets content-type for FormData
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      const data = await res.json();
      return data.post; // return created post
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch posts by userId
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/posts/fetchPosts/${userId}`,
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch posts");
      }

      const data = await res.json();
      return data; // array of posts
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Toggle like
export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      debugger
      const res = await fetch(`${API_BASE_URL}/posts/like/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || "Failed to toggle like");
      }

      const data = await res.json();
      return data; // updated post
    } catch (err) {
      return rejectWithValue(err.message || "Network error while toggling like");
    }
  }
);

// Add comment
export const addComment = createAsyncThunk(
  "posts/addComment",
  async ({ postId, userId, text }, { rejectWithValue }) => {
    try {
      debugger
      const res = await fetch(`${API_BASE_URL}/posts/comment/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || "Failed to add comment");
      }

      const data = await res.json();
      return data; // updated post
    } catch (err) {
      return rejectWithValue(err.message || "Network error while adding comment");
    }
  }
);

// Async thunk to fetch posts
export const getPosts = createAsyncThunk(
  "posts/getPosts",
  async ({ page, limit = 7 }, { rejectWithValue }) => {
    try {
      // debugger
      const res = await apiClient.get(`/posts/getPosts?page=${page}&limit=${limit}`);
      debugger
      return res.data;
      
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// ================== SLICE ==================
const postSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    page: 1,
    hasMore: true,
    loading: false,
    error: null,
  },
  reducers: {
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
      state.loading = false;
      state.error = null;
    },

  },
  extraReducers: (builder) => {
    builder
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload); // add new post to top
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost; // replace with updated post (with likes array)
        }
      })

      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost; // replace with updated post (with comments array)
        }
      })
      // Infinite scroll - pagination
      .addCase(getPosts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.loading = false;
        const { posts, hasMore, page } = action.payload;
      
        state.hasMore = hasMore;
        state.page = page;
      
        if (page === 1) {
          state.posts = posts; // replace on fresh load
        } else {
          state.posts = [...state.posts, ...posts]; 
          console.log("Posts from slice,",posts)// append
        }
      })
      
      
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default postSlice.reducer;

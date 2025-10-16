import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../constants/api";
import { apiClient } from "../../../constants/api";

//Register Thunk

export const createUsers = createAsyncThunk(
  "createUsers", async (data, { rejectWithValue }) => {
    console.log("data", data);
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = result?.message || "Registration failed";
        return rejectWithValue(message);
      }
      return result; // { message, token, user }
    }
    catch (error) {
      return rejectWithValue(error.message || "Request failed");
    }
  }

);

// Login User
export const loginUser = createAsyncThunk(
  'auth/login',
  async (formData, { rejectWithValue }) => {
    try {
      const payload = {
        identifier: formData.email, // email or username typed into the single field
        password: formData.password,
      };
      debugger;
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.message || "Login failed";
        return rejectWithValue(message);
      }

      try { localStorage.setItem("token", data.token); } catch { }
      return data;  // { token, user }
    } catch (error) {
      return rejectWithValue(error.message || 'Request failed');
    }
  }
);

export const showUsers = createAsyncThunk(
  "showUsers",
  async (args, { rejectWithValue }) => {
    debugger
    const response = await fetch(`${API_BASE_URL}/users/getUsers`);
    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Upload Profile Picture
export const uploadProfilePicture = createAsyncThunk(
  "profile/uploadProfilePicture",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      debugger
      if (!userId) throw new Error("UserId is missing!");

      const response = await fetch(`${API_BASE_URL}/profile/upload/${userId}`, {
        method: "PUT",
        body: formData, // leave headers out!
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        return rejectWithValue(result.message || "Upload failed");
      }

      // Expecting { message, user }
      return result.user || null;
    } catch (error) {
      return rejectWithValue(error.message || "Upload failed");
    }
  }
);


export const fetchCurrentUser = createAsyncThunk(
  "app/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No token found");

      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await res.json();
      return data; // ✅ backend returns user object directly
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update bio
export const updateUserBio = createAsyncThunk(
  "auth/updateUserBio",
  async ({ userId, bio }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await apiClient.put(`/users/${userId}/bio`, { bio }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update bio");
    }
  }
);
// Follow user thunk
export const followUser = createAsyncThunk(
  "auth/followUser",
  async ({ currentUserId, targetUserId }, { rejectWithValue }) => {
    try {
      debugger
      const res = await fetch(`${API_BASE_URL}/users/${targetUserId}/follow`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentUserId, targetUserId }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Follow failed");

      return data; // Expecting backend to return { currentUser, targetUser }
    } catch (err) {
      return rejectWithValue(err.message || "Follow failed");
    }
  }
);

// Unfollow user thunk
export const unfollowUser = createAsyncThunk(
  "auth/unfollowUser",
  async ({ currentUserId, targetUserId }, { rejectWithValue }) => {
    try {
      debugger
      const res = await fetch(`${API_BASE_URL}/users/${targetUserId}/unfollow`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentUserId, targetUserId }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Unfollow failed");

      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Unfollow failed");
    }
  }
);

export const followData = createAsyncThunk(
  'auth/followData',
  async (userId, { rejectWithValue }) => {
    try {
      debugger
      const response = await fetch(`${API_BASE_URL}/users/${userId}/follow-data`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch follow data');
      }
      console.log("Follow Data:", data);
      return data; // { followers, following }
    } catch (error) {
      return rejectWithValue(error.message || 'Request failed');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      debugger
      const res = await fetch(`${API_BASE_URL}/users/${userId}/getUserById`);

      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || "Failed to fetch user");
      }

      const data = await res.json();
      return data // assuming backend returns { user: {...} }
    } catch (error) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  token: localStorage.getItem('token') || null,
  followers: [],
  following: [],
}


export const authSlice = createSlice({
  name: "auth",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(createUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload?.user || null;
        if (action.payload?.token) {
          state.token = action.payload.token;
          try { localStorage.setItem('token', action.payload.token); } catch { }
        }
      })
      .addCase(createUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = false;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.loading = false;
        state.token = action.payload.token;
        try { localStorage.setItem('token', action.payload.token); } catch { }
      })


      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(showUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(showUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload; // whatever is in payload it will be entered to global state
      })
      .addCase(showUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error?.message || 'Something went wrong';
      })
      // Profile Picture Upload Cases
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        // Update the current user's profile picture
        if (state.currentUser && state.currentUser._id === action.payload._id) {
          state.currentUser = action.payload;
        }
        // Update user in users array if it exists
        const userIndex = state.users.findIndex(user => user._id === action.payload._id);
        if (userIndex !== -1) {
          state.users[userIndex] = action.payload;
        }
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload; // ✅ correct
      })

      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.currentUser = null;
        state.error = action.payload;
      })

      .addCase(followUser.fulfilled, (state, action) => {
        // Update currentUser and the users array
        const updatedUser = action.payload.currentUser;
        state.currentUser = updatedUser;

        // Update users array if the followed user exists
        const index = state.users.findIndex(u => u._id === action.payload.targetUser._id);
        if (index !== -1) state.users[index] = action.payload.targetUser;

        state.following = currentUser.following;
        state.followers = currentUser.followers;
      })

      .addCase(unfollowUser.fulfilled, (state, action) => {
        const updatedUser = action.payload.currentUser;
        state.currentUser = updatedUser;

        const index = state.users.findIndex(u => u._id === action.payload.targetUser._id);
        if (index !== -1) state.users[index] = action.payload.targetUser;
      })

      .addCase(followUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(followData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(followData.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload.followers; // ✅ save followers
        state.following = action.payload.following; // ✅ save following
      })
      .addCase(followData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.user;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateUserBio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserBio.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateUserBio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


  }
});

export default authSlice.reducer;



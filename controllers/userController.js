import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import Notification from "../models/notifications.js";

export const RegisterUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "Name, email, username and password are required" });
    }

    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Basic username validation: 3-30 chars, letters, numbers, underscores, dots
    const normalizedUsername = String(username).trim().toLowerCase();
    const usernameRegex = /^(?=.{3,30}$)[a-z0-9._]+$/;
    if (!usernameRegex.test(normalizedUsername)) {
      return res.status(400).json({ message: "Username must be 3-30 chars: letters, numbers, '.', '_' only" });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existingUserByUsername = await User.findOne({ username: normalizedUsername });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      username: normalizedUsername,
      password: hashedPassword,
    });

    const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";
    const token = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: "7d" });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const LoginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    const isEmail = emailRegex.test(String(identifier));

    const query = isEmail
      ? { email: identifier }
      : { username: String(identifier).trim().toLowerCase() };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1h" });

    console.log("User logged in:", user.name);
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Current User

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const freshUser = await User.findById(req.user._id).select('-password');

    return res.status(200).json({
      id: freshUser._id,
      name: freshUser.name,
      email: freshUser.email,
      username: freshUser.username,
      profilePicture: freshUser.profilePicture || null,
      bio: freshUser.bio || "",
      following: freshUser.following || [],
      followers: freshUser.followers || [],
      posts: freshUser.posts || [],
    });
  } catch (err) {
    console.error("Error fetching current user:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Follow a user
export const followUser = async (req, res) => {
  try {
    const { id } = req.params; // user to follow
    const currentUserId = req.body.currentUserId;

    if (id === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json({ message: "Already following" });
    }

    userToFollow.followers.push(currentUserId);
    currentUser.following.push(id);

    await userToFollow.save();
    await currentUser.save();

     // 👉 Create notification for follow
     await Notification.create({
      receiver: userToFollow._id,
      sender: currentUserId,
      type: "follow"
    });

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params; // user to unfollow
    const currentUserId = req.body.currentUserId;

    if (id === currentUserId) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!userToUnfollow.followers.includes(currentUserId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (f) => f.toString() !== currentUserId
    );

    currentUser.following = currentUser.following.filter(
      (f) => f.toString() !== id
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//logic for getting followers and following data

export const getFollowData = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .populate('followers', 'username profilePicture') // only get username + profilePic
      .populate('following', 'username profilePicture');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      followers: user.followers,
      following: user.following,
    })
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture")
      .populate({
        path: "posts",          // 👈 Populate the posts array
        model: "Post",          // 👈 Make sure your Post model is named "Post"
        populate: {
          path: "comments",     // 👈 (Optional) if you want comments populated
          populate: { path: "user", select: "username profilePicture" }
        }
      });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update bio
export const updateBio = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio } = req.body;
    if (typeof bio !== 'string' || bio.length > 150) {
      return res.status(400).json({ message: "Bio must be a string up to 150 chars" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { bio },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePicture: user.profilePicture || null,
      bio: user.bio || "",
      following: user.following || [],
      followers: user.followers || [],
      posts: user.posts || [],
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}


import User from "../models/users.js";

// Controller function to handle profile picture upload
export const uploadProfilePic = async (req, res) => {
  try {
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: `/uploads/${req.file.filename}` }, // store path/URL only
      { new: true }
    );

    res.json({
      message: "Profile picture uploaded successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
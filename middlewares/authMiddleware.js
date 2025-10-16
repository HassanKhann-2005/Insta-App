import jwt from "jsonwebtoken";
import User from "../models/users.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token
      const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";

      // Verify token
      const decoded = jwt.verify(token, jwtSecret);

      // Attach user to request (exclude password)
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (err) {
      console.error("Auth middleware error:", err);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

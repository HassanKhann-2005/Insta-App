import { io } from "socket.io-client";

// Use same-origin so Vite proxy handles dev, and prod uses same host
export const socket = io({
  transports: ["websocket", "polling"],
  withCredentials: true,
});

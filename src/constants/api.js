export const API_BASE_URL = "/api"; // dev uses Vite proxy; production should be same-origin /api


// Centralized axios instance; interceptors are attached in setupApiInterceptors
import axios from "axios";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Media (e.g., /uploads/...) should be served from the backend origin.
// In dev, use current origin (proxied by Vite). In prod, also same-origin.
export const MEDIA_BASE_URL =
    typeof window !== "undefined" && window.location ? window.location.origin : "";

export const buildMediaUrl = (path) => {
    if (!path) return "";
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${MEDIA_BASE_URL}${normalized}`;
};
import { configureStore } from "@reduxjs/toolkit";
import auth from "./features/auth/authSlice";
import posts from "./features/posts/postSlice";
import stories from "./features/stories/storiesSlice";
import notifications from "./features/notifications/notificationSlice";
import messages from "./features/messages/messageSlice";
import ui from "./features/ui/uiSlice";

export const store = configureStore({
    reducer:{
        app:auth,
        posts:posts,
        stories:stories,
        notifications:notifications,
        messages:messages,
        ui: ui,
    }
})
export default store;
import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register/Register"
import Login from "./pages/Login/Login"
import Home from "./pages/Home/Home"
import Profile from "./pages/Profile/ProfilePic"
import Posts from "./components/Posts";
import CreatePosts from "./pages/Posts/CreatePosts";
import UserProfile from "./pages/UserProfile/UserProfile";
import Notifications from "./pages/Notifications/Notifications";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes";
import Message from "./pages/messages/messages";
import GlobalLoader from "./components/GlobalLoader";

function App() {


  return (
    <>
      <BrowserRouter>
        <GlobalLoader />
        <Routes>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
          <Route path="/users/register" element={<Register />} />
          <Route path="/users/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/createposts" element={<CreatePosts />} />
          <Route path="/userprofile/:id" element={<UserProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/posts/:id" element={<Posts />} />
          <Route path="/messages" element={<Message />} />
         
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Recipe from "./components/Recipe";
import Recipes from "./components/Recipes";
import Register from "./components/Register";
import User from "./components/User";
import Bookmarks from "./components/Bookmarks";
import AdminDashboard from "./components/AdminDashboard";
import NewRecipe from "./components/NewRecipe";
import AuthorProfile from "./components/AuthorProfile";
import Notifications from "./components/Notifications";
import EditRecipe from "./components/EditRecipe";
import "./App.css";
import React from "react";
import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./responsive.css";
import Contact from "./components/Contact";
import ActivityFeed from "./components/ActivityFeed";
import { createContext } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext.js";

function App() {
  const socket = io("http://localhost:3000");

  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const FE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
  
  // Check logged in token expiration and auto-logout if expired
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const userId = decodedUser.userId;
        //after verifying the token, emit the join event
        socket.emit("join", userId); 
        
        if (decodedUser.exp * 1000 < Date.now()) {
          // Token expiration time is in seconds
          localStorage.clear();
          setToken(null);
          setIsAdmin(false);
          return;
        }
        setToken(token); // Set the token in state
        setIsAdmin(decodedUser.isAdmin || false);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.clear();
        setToken(null);
        setIsAdmin(false);
      }
    } else {
      setToken(null);
    }
  }, [socket]);

  const navbarKey = token ? `${token}-${isAdmin}` : "no-token";

  return (
    <SocketContext.Provider value={socket}> {/*Provide the socket to the context*/}
    <div className="background">
      <GoogleOAuthProvider clientId={FE_GOOGLE_CLIENT_ID}>
        <Router>
          <Navbar
            key={navbarKey}
            token={token}
            setToken={(newToken) => {
              setToken(newToken);
              if (newToken) {
                try {
                  const decodedUser = jwtDecode(newToken);
                  setIsAdmin(decodedUser.isAdmin || false);
                } catch {
                  setIsAdmin(false);
                }
              } else {
                setIsAdmin(false);
              }
            }}
            isAdmin={isAdmin}
          />
          <main>
            <Routes>
              <Route path="/user" element={<User setToken={setToken} />} />
              {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
              <Route path="/login" element={<Login setToken={setToken} />} />
              <Route
                path="/register"
                element={<Register setToken={setToken} />}
              />
              <Route path="/recipe/:id" element={<Recipe />} />
              <Route path="/" element={<Recipes />} />
              <Route path="/new-recipe" element={<NewRecipe />} />
              <Route path="/edit-recipe/:id" element={<EditRecipe />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/author/:authorId" element={<AuthorProfile />} />
              <Route path="/latest" element={<ActivityFeed />} />
              <Route path="*" element={<div>Page Not Found</div>} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
        </Router>
      </GoogleOAuthProvider>
    </div>
    </SocketContext.Provider>
  );
}

export default App;

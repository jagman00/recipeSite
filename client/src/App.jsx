import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Recipe from './components/Recipe'
import Recipes from './components/Recipes'
import Register from './components/Register'
import User from './components/User'
import AdminDashboard from './components/AdminDashboard'
import NewRecipe from './components/newRecipe';
import './App.css'
import React from 'react'
import { useEffect } from 'react'
import { jwtDecode } from "jwt-decode";
import "./responsive.css";

function App() {
  const [token, setToken] = useState(null);

  // Check logged in token expiration and auto-logout if expired
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 < Date.now()) { // Token expiration time is in seconds
          localStorage.clear(); 
          setToken(null); 
          return;
        }
        setToken(token); // Set the token in state
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.clear();
        setToken(null);
      }
    } else {
      setToken(null);
    }
  }, []);

  return (
      <div className="background">  
        <Router>
          <Navbar token={token} setToken={setToken} />
          <Routes>
            <Route path="/user" element={<User setToken={setToken}/>} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login setToken={setToken}  />} />
            <Route path="/register" element={<Register setToken={setToken}  />} />
            <Route path="/recipe/:id" element={<Recipe />} />
            <Route path="/" element={<Recipes />} />
            <Route path="/new-recipe" element={<NewRecipe />} />
          </Routes>
        </Router>
      </div>
  )
}

export default App

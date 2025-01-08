import { useState } from "react";
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';

import '../App.css';
import React from 'react';
import userIcon from '../assets/UserIconWhite.png';
import logoIcon from '../assets/RoundTable.png';
import { jwtDecode } from "jwt-decode";

function Navbar({ setToken }) {
  const token = localStorage.getItem("token"); // Get the token from localStorage if any
  let isValidAdmin = false; // Default value for admin check
  let userId = null; // User ID for profile navigation

  if (token) {
    try {
      const decodedToken = jwtDecode(token); // Decode the token
      isValidAdmin = decodedToken.isAdmin || false; // Check if the user is an admin
      userId = decodedToken.userId; // Extract user ID from the token
    } catch (error) {
      console.error("Invalid token:", error.message);
      localStorage.clear(); // Clear invalid token from storage
    }
  }

  return (
    <nav className="navbar">
      <Link to='/'>
        <div id="logoContainer">
          <img id="logoIcon" src={logoIcon} alt="Website logo" />
          <span className="header" id="logoText">Recipe Round Table</span>
        </div>
      </Link>
      <div id="searchbarContainer">
        <input id="searchbar" type='text' placeholder='Search for recipes or users'></input>
        <button>Search</button>
      </div>
      {token ? (
        <>
          <Link id="userIcon" to={`/user`}>
            <div id="userIconContainer">
              <img src={userIcon} alt="User icon" />
              <span>Profile</span>
            </div>
          </Link>
          {isValidAdmin && (
            <Link to="/admin">Admin Dashboard</Link>
          )}
        </>
      ) : (
        <>
          <Link id="userIcon" to='/login'>
            <div id="userIconContainer">
              <img id="helmetIcon" src={userIcon} alt="User icon" />
              <span>Login</span>
            </div>
          </Link>
          <Link id="registerText" to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

Navbar.propTypes = {
  setToken: PropTypes.func.isRequired,
};
export default Navbar;

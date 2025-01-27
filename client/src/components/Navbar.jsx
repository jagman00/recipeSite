import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import userIcon from "../assets/UserIconWhite1.png";
import logoIcon from "../assets/RoundTable.png";
import { jwtDecode } from "jwt-decode";
import NotificationBell from "./NotificationBell";
import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

function Navbar({ token, setToken, isAdmin }) {
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const updateTokenState = () => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);  // Update parent component's token

    if (currentToken) {
      try {
        const decodedToken = jwtDecode(currentToken);
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        setToken(null);  // Reset token state in parent
      }
    } else {
      
      setUserId(null);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
    navigate("/", { state: { searchQuery } });
    }
  };

  const handleLogout = () => {
    socket.emit("leave", userId)
    localStorage.clear();
    setToken(null);
    navigate("/"); // Redirect to home page after logout
  };


  useEffect(() => {
    updateTokenState();

    window.addEventListener("storage", updateTokenState);
    return () => {
      window.removeEventListener("storage", updateTokenState);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) // Check if click is outside
      ) {
        setDropdownVisible(false);
      }
    };

    if (dropdownVisible) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [dropdownVisible]);

  return (
    <nav className="navbar">
      <Link to="/">
        <div id="logoContainer">
          <img id="logoIcon" src={logoIcon} alt="Website logo" />
          <span className="header" id="logoText">
            Recipe Round Table
          </span>
        </div>
      </Link>
      <div id="searchbarContainer">
        <input
          id="searchbar"
          type="text"
          placeholder="Search for recipes or users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(); // Trigger search on Enter key press
            }
          }}
          enterKeyHint="search" 
          inputMode="search" 
        />

        <button id="searchBtn" onClick={handleSearch}>
          <img src="../src/assets/SearchIcon.png" alt="Search Icon" />
          Search
        </button>
      </div>
      <div className="notificationBell">
        {token && <NotificationBell userId={userId}/>}
      </div>
      <div className="dropdownMenu" ref={dropdownRef}>
        <button
          className="dropdownToggle"
          onClick={() => setDropdownVisible(!dropdownVisible)}
        >
          <div id="userIconContainer">
            <span>Menu</span>
            <img src={userIcon} alt="User icon" />
          </div>
        </button>
        {dropdownVisible && (
          <div className="dropdown">
            {token ? (
              <>
                <Link
                  className="postrecipebutton"
                  to="/user"
                  onClick={() => setDropdownVisible(false)}
                >
                  Profile
                </Link>
                <Link
                  id="latestBtn"
                  className="header"
                  to="/latest"
                >
                  Feed
                </Link>
                <Link
                  className="postrecipebutton"
                  to="/new-recipe"
                  onClick={() => setDropdownVisible(false)}
                >
                  Add New Recipe
                </Link>
                <Link
                  id="bookmarksBtn"
                  className="header"
                  to="/bookmarks"
                  onClick={() => setDropdownVisible(false)}
                >
                  Bookmarks
                </Link>
                <Link
                  className="postrecipebutton"
                  to="/contact"
                  onClick={() => setDropdownVisible(false)}
                >
                  Contact
                </Link>
                {isAdmin && (
                  <Link
                    className="adminDashboardButton"
                    to="/admin"
                    onClick={() => setDropdownVisible(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button className="logoutButton" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="postrecipebutton"
                  to="/login"
                  onClick={() => setDropdownVisible(false)}
                >
                  Login
                </Link>
                <Link
                  className="postrecipebutton"
                  to="/register"
                  onClick={() => setDropdownVisible(false)}
                >
                  Register
                </Link>
                <Link
                  className="header"
                  to="/contact"
                  onClick={() => setDropdownVisible(false)}
                >
                  Contact
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import userIcon from "../assets/UserIconWhite.png";
import logoIcon from "../assets/RoundTable.png";
import { jwtDecode } from "jwt-decode";

function Navbar({ token, setToken }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const updateTokenState = () => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);  // Update parent component's token

    if (currentToken) {
      try {
        const decodedToken = jwtDecode(currentToken);
        setIsAdmin(decodedToken.isAdmin || false);
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        setToken(null);  // Reset token state in parent
      }
    } else {
      setIsAdmin(false);
      setUserId(null);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
    navigate("/", { state: { searchQuery } });
    }
  };


  useEffect(() => {
    updateTokenState();

    window.addEventListener("storage", updateTokenState);
    return () => {
      window.removeEventListener("storage", updateTokenState);
    };
  }, []);


// *** thu token state
  //   const handleStorageChange = () => {
  //     updateTokenState();
  //   };

  //   // Listen for changes to localStorage (such as token update)
  //   window.addEventListener("storage", handleStorageChange);

  //   return () => {
  //     // Clean up the event listener when the component is unmounted
  //     window.removeEventListener("storage", handleStorageChange);
  //   };
  // }, []); // Empty dependency array to run only once on mount

  return (
    <nav className="navbar">
      <Link to="/">
        <div id="logoContainer">
          <img id="logoIcon" src={logoIcon} alt="Website logo" />
          <span className="header" id="logoText">Recipe Round Table</span>
        </div>
      </Link>
      <div id="searchbarContainer">
        <input
          id="searchbar"
          type="text"
          placeholder="Search for recipes or users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {token ? (
        <>
        <Link to="/new-recipe">
        <button className="postrecipebutton">Add New Recipe!</button>
      </Link>
          <Link id="userIcon" to={`/user`}>
            <div id="userIconContainer">
              <img src={userIcon} alt="User icon" />
              <span>Profile</span>
            </div>
          </Link>
          {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
        </>
      ) : (
        <>
          <Link id="userIcon" to="/login">
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

export default Navbar;
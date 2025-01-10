import React, { useEffect, useState } from "react";
import { fetchUser, updateUser } from "../API/index.js"; // Importing the fetchUser function
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

const GetUser = ({setToken}) => {
  const [userInfo, setUserInfo] = useState({
    recipes: [], // Ensure recipes is always an array
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Track admin status
  const [userId, setUserId] = useState(null); // Store userId
  const [editMode, setEditMode] = useState(false); // Track edit mode
  const [editProfile, setEditProfile] = useState({}); // Editable profile fields
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decode the token
        setIsAdmin(decodedToken.isAdmin || false); // Set admin status
        setUserId(decodedToken.userId); // Extract and set userId
        setLoggedIn(true); // User is logged in
        fetchLoggedInUser(token);
      } catch (error) {
        console.error("Error decoding token:", error);
        setErrorMessage("Invalid authentication token. Please log in again.");
        localStorage.clear();
        setLoggedIn(false);
      }
    } else {
      setLoggedIn(false);
    }
  }, []);

  const fetchLoggedInUser = async (token) => {
    setErrorMessage("");
    setUserInfo({
      recipes: [], // Ensure recipes is an array
    });

    try {
      const response = await fetchUser(token);
      if (response !== undefined) {
        setUserInfo(response);
        setEditProfile({
          name: response.name,
          email: response.email,
          userTitle: response.userTitle || "",
          bio: response.bio || "",
        });
      } else {
        setErrorMessage(response?.message || "Unable to fetch user information.");
      }
    } catch (error) {
      console.error("Error Fetching User Info:", error);
      setErrorMessage("An error occurred while fetching user information.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setToken(null);
    setUserInfo({
      recipes: [], // Reset recipes
    });
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    // Use the current values from the form (stored in the editProfile state)
    const updatedProfile = {
      name: editProfile.name, // Get the updated name from the form
      email: editProfile.email, // Get the updated email from the form
      profileUrl: editProfile.profileUrl || userInfo.profileUrl, // Only update if the profileUrl was changed
      userTitle: editProfile.userTitle, // Get the updated userTitle from the form
      bio: editProfile.bio, // Get the updated bio from the form
    };
  
    try {
      const updatedUser = await updateUser(userId, updatedProfile);

      console.log("User updated successfully:", updatedUser);
      setUserInfo(updatedUser); // Update the user info in the state
      // Fetch the updated user again to ensure consistency
      await fetchLoggedInUser(localStorage.getItem("token"));
      setEditMode(false); // Exit edit mode after saving
    } catch (error) {
      console.error("Error saving profile changes:", error);
    }
  };
  
  return (
    <div id="userComponent">
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {loggedIn ? (
        userInfo ? (
          <div id="userContainer">
            <div id="userPicAndDetailsContainer">
              <div id="profileBorder">
                <div id="userProfilePicContainer">
                  <img src={userInfo?.profileUrl} alt="User Profile" />
                </div>
              </div>
              <div id="userDetailsContainer">
                <h3 className="header">User Details</h3>
                {editMode ? (
                  <form>
                    <label>
                      <strong>Name:</strong>
                      <input
                        type="text"
                        name="name"
                        value={editProfile.name}
                        onChange={handleProfileChange}/>
                    </label>
                    <label>
                      <strong>Email:</strong>
                      <input
                        type="email"
                        name="email"
                        value={editProfile.email}
                        onChange={handleProfileChange}/>
                    </label>
                    <label>
                      <strong>Profile Picture URL:</strong>
                      <input
                        type="text"
                        name="profileUrl"
                        value={editProfile.profileUrl}
                        onChange={handleProfileChange}/>
                    </label>
                    <label>
                      <strong>Title:</strong>
                      <input
                        type="text"
                        name="userTitle"
                        value={editProfile.userTitle}
                        onChange={handleProfileChange}/>
                    </label>
                    <label>
                      <strong>Bio:</strong>
                      <textarea
                        name="bio"
                        rows="4"
                        cols="39"
                        value={editProfile.bio}
                        onChange={handleProfileChange}/>
                    </label>
                    <div id="editBtnContainer">
                      <button id="editSaveBtn" type="button" onClick={handleSaveProfile}>
                        Save
                      </button>
                      <button id="editCancelBtn" type="button" onClick={handleEditToggle}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p><strong>Name:</strong> {userInfo.name}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Title:</strong> {userInfo.userTitle || "Not provided"}</p>
                    <p><strong>Bio:</strong> {userInfo.bio || "Not provided"}</p>
                    {isAdmin && <p><strong>Admin:</strong> Yes</p>}
                    <button id="editProfileBtn" onClick={handleEditToggle}>Edit Profile</button>
                  </>
                )}
              </div>
            </div>
            {!editMode && (
              <button onClick={handleLogout} id="logoutButton">
              Logout
            </button>
            )}
            <h3 className="header">Your Recipes</h3>
                {userInfo.recipes && userInfo.recipes.length > 0 ? (
                    <div className="recipe-list">
                    {userInfo.recipes.map((recipe) => (
                        <div key={recipe.recipeId} className="recipe-card">
                            <Link to={`/recipe/${recipe.recipeId}`}>
                                <div id="imgContainer">
                                    <img src={recipe.recipeUrl} className="image" alt={recipe.title} />
                                </div>
                            </Link>
                            <div id="recipeBar">
                                <h4>{recipe.title}</h4>
                                <div id="likesAndBookmarks">
                                    <p>
                                        <img src="../src/assets/likesIcon.png" alt="likes" />{" "}
                                        {recipe._count?.likes || 0}
                                    </p>
                                    <p>
                                        <img src="../src/assets/bookmarksIcon.png" alt="bookmarks" />{" "}
                                        {recipe._count?.bookmarks || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
            ) : (
              <p id="noRecipes">No recipes found.</p>
            )}
          </div>
        ) : (
          <p>Loading user information...</p>
        )
      ) : (
        <div className="loginComponent">
          <p><strong>You are not logged in. Please log in to view your profile.</strong></p>
          <br />
          <button onClick={handleLogin} id="loginButton">
            Login
          </button>
        </div>
      )}
    </div>
  );
};

export default GetUser;

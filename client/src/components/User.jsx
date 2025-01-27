import React, { useEffect, useState } from "react";
import { fetchUser, updateUser,fetchFollowers, fetchFollowings } from "../API/index.js"; // Importing the fetchUser function
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import FollowButton from "./FollowButton";
import Modal from "./Modal.jsx";  
import axios from "axios";

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

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); // State for modal
  const [modalTitle, setModalTitle] = useState(""); // Title for the modal
  const [modalContent, setModalContent] = useState(null); // Content of the modal
  const [loading, setLoading] = useState(true); 
  
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
  }, [userId]);

  const fetchLoggedInUser = async (token) => {
    setLoading(true);
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

        const followersData = await fetchFollowers(response.userId);
        setFollowerCount(followersData.followerCount);
        setFollowers(followersData.followerList || []);

        const followingsData = await fetchFollowings(response.userId);
        setFollowingCount(followingsData.followingCount);
        setFollowings(followingsData.followingList || []);
      } else {
        setErrorMessage(response?.message || "Unable to fetch user information.");
      }
    } catch (error) {
      console.error("Error Fetching User Info:", error);
      setErrorMessage("An error occurred while fetching user information.");
    } finally {
      setLoading(false); // End loading
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
      // profileUrl: editProfile.profileUrl || userInfo.profileUrl, // Only update if the profileUrl was changed
      profileUrl: userInfo.profileUrl, // Use the latest profileUrl from state
      userTitle: editProfile.userTitle, // Get the updated userTitle from the form
      bio: editProfile.bio, // Get the updated bio from the form
    };
  
    try {
      const updatedUser = await updateUser(userId, updatedProfile);

      // console.log("User updated successfully:", updatedUser);
      setUserInfo(updatedUser); // Update the user info in the state
      // Fetch the updated user again to ensure consistency
      await fetchLoggedInUser(localStorage.getItem("token"));
      setEditMode(false); // Exit edit mode after saving
    } catch (error) {
      console.error("Error saving profile changes:", error);
    }
  };

  /* Follow List */
  const handleFollowChange = (userId, isFollowing, username) => {
    if (isFollowing) {
      //Add the user to the `followings` list if followed
      const newFollowing = {
        userId,
        name: username, 
        //profileUrl: "/path/to/profile/image", 
      };
      setFollowings((prevFollowings) => [...prevFollowings, newFollowing]);
      setFollowingCount((prevCount) => prevCount + 1); // Increase count
    } else {
      // Remove the user from the `followings` list if unfollowed
      setFollowings((prevFollowings) =>
        prevFollowings.filter((user) => user.userId !== userId)
      );
      setFollowingCount((prevCount) => prevCount - 1); // Decrease count
    }
  };

  const handleViewFollowers = () => {
    setModalTitle("Followers");
    setModalContent(
      followers.length > 0 ? (
        followers.map((follower) => (
          <div key={follower.userId} className="follower">
            <Link to={`/author/${follower.userId}`}>{follower.name}</Link>
            <FollowButton
              authorId={follower.userId}
              onFollowChange={handleFollowChange}
              authorName={follower.name}
            />
          </div>
        ))
      ) : (
        <p>You have no followers yet.</p>
      )
    );
    setModalOpen(true);
  };
  
  const handleViewFollowings = () => {
    setModalTitle("Following");
    setModalContent(
      followings.length > 0 ? (
        followings.map((following) => (
          <div key={following.userId} className="following">
            <Link to={`/author/${following.userId}`}>{following.name}</Link>
            <FollowButton
              authorId={following.userId}
              onFollowChange={handleFollowChange}
              authorName={following.name}
            />
          </div>
        ))
      ) : (
        <p>You are not following anybody yet.</p>
      )
    );
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalTitle("");
    setModalContent(null);
  };

  // Profile Image Upload (Edit Profile)
  const handleProfileImageUpload = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();  
    formData.append("profileImage", e.target.files[0]);
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:3000/api/users/${userId}/upload-profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Refresh user info to reflect the new profile image
      await fetchLoggedInUser(token);
    } catch (error) {
      console.error("Error uploading profile image:", error);
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
                  <img src={
                        userInfo.profileUrl?.startsWith("http") 
                          ? userInfo.profileUrl // Use external URLs as-is
                          : `http://localhost:3000${userInfo.profileUrl}` // Prepend base URL for local paths
                      } 
                      alt="User Profile" />
                </div>
              </div>
              <div id="userDetailsContainer">
                <h3 className="header">User Details</h3>
                {editMode ? (
                  <form id="editUserForm">
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
                      <br />
                      <input 
                        type="file" 
                        onChange={handleProfileImageUpload} 
                        name="profileUrl" />
                    </label>
                    <br />
                    <label>
                      <strong>Title:</strong>
                      <input
                        type="text"
                        name="userTitle"
                        value={editProfile.userTitle}
                        onChange={handleProfileChange}/>
                    </label>
                    <br />
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
                  <div id="mainDetailView">
                    <p><strong>Name:</strong> {userInfo.name}</p>
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <p><strong>Title:</strong> {userInfo.userTitle || "Not provided"}</p>
                    <p><strong>Bio:</strong> {userInfo.bio || "Not provided"}</p>
                    {isAdmin && <p><strong>Admin:</strong> Yes</p>}

                    <span className="cursor" onClick={handleViewFollowers}>
                      <strong>Followers:</strong>{" "}
                      {followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + "k" : followerCount}
                    </span>{" "}
                    <span className="cursor"onClick={handleViewFollowings}>
                      <strong>Following:</strong>{" "}
                      {followingCount >= 1000 ? (followingCount / 1000).toFixed(1) + "k" : followingCount}
                    </span>

                    <button id="editProfileBtn" onClick={handleEditToggle}>Edit Profile</button>
                  </div>
                )}
              </div>

              <Modal
                isOpen={modalOpen} 
                onClose={handleCloseModal}
                title={modalTitle}
              >
                {modalContent}
              </Modal>

            </div>
            {!editMode && (
              <button onClick={handleLogout} id="logoutButton">
              Logout
            </button>
            )}

            <h3 className="header" id="yourRecipesHeader">Your Recipes</h3>
                {userInfo.recipes && userInfo.recipes.length > 0 ? (
                    <div className="recipeList">
                    {userInfo.recipes.map((recipe) => (
                        <div key={recipe.recipeId} className="recipeCard">
                            <Link to={`/recipe/${recipe.recipeId}`}>
                                <div id="profileImgContainer">
                                    <img 
                                    src={recipe.recipeUrl.includes("http") ? recipe.recipeUrl:`http://localhost:3000${recipe.recipeUrl}`}
                                    className="image" 
                                    alt={recipe.title} />
                                </div>
                            </Link>
                            <div id="recipeBar">
                                <h4>{recipe.title}</h4>
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

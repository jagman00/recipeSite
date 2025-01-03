import React, { useEffect, useState } from "react";
import { fetchUser } from "../API/index.js"; // Importing the fetchUser function

const GetUser = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
    if (token) {
      fetchLoggedInUser(token);
    } else {
      setErrorMessage("No authentication token found. Please log in.");
    }
  }, []);

  const fetchLoggedInUser = async (token) => {
    setErrorMessage("");
    setUserInfo(null);

    try {
      const response = await fetchUser(token);
      if (response !== undefined) {
        setUserInfo(response);
      } else {
        setErrorMessage(response?.message || "Unable to fetch user information.");
      }
    } catch (error) {
      console.error("Error Fetching User Info:", error);
      setErrorMessage("An error occurred while fetching user information.");
    }
  };

  return (
    <div>
      <h2>Welcome, User!</h2>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {userInfo ? (
        <div>
          <h3>User Details:</h3>
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Title:</strong> {userInfo.userTitle || "Not provided"}</p>
          <p><strong>Bio:</strong> {userInfo.bio || "Not provided"}</p>
          <p><strong>Admin:</strong> {userInfo.isAdmin ? "Yes" : "No"}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

export default GetUser;

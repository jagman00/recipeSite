import React, { useState, useEffect } from "react";
import { toggleFollow,fetchFollowStatus } from "../API/index.js"; 

const FollowButton = ({ authorId }) => {
  const [isFollowing, setIsFollowing] = useState(null);
  const token = localStorage.getItem("token");
  console.log("authorId", authorId);
  
  
    useEffect(() => {
        const getFollowStatus = async () => {
        try {
            const response = await fetchFollowStatus(authorId);
            
            setIsFollowing(response);
        } catch (error) {
            console.error("Failed to fetch follow status:", error);
        }
        };
        getFollowStatus();
    }, [authorId,token]);

  const handleFollowToggle = async () => {
    try {
      const response = await toggleFollow(authorId); 
      setIsFollowing(response.followStatus);
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  if (isFollowing===null) return <p>Loading...</p>;

  return (
    <button onClick={handleFollowToggle} className="followButton">
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};
export default FollowButton;
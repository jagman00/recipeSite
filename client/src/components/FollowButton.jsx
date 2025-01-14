import React, { useState, useEffect } from "react";
import { toggleFollow, fetchFollowStatus } from "../API/index.js";

const FollowButton = ({ authorId, onFollowChange, authorName }) => {
  const [isFollowing, setIsFollowing] = useState(null);

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
  }, [authorId]);

  const handleFollowToggle = async () => {
    try {
      const response = await toggleFollow(authorId);
      setIsFollowing(response.followStatus);
      if (onFollowChange) {
        onFollowChange(authorId, response.followStatus, authorName);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  if (isFollowing === null) return <p>Loading...</p>;

  return (
    <button id="followButton" onClick={handleFollowToggle} className="followButton">
      {isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;

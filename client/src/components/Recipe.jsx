import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { fetchRecipe } from "../API/index.js";
import FollowButton from "./FollowButton";

const Recipe = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportDropdown, setShowReportDropdown] = useState(false);
  const [commentDropdownVisible, setCommentDropdownVisible] = useState({});
  const [selectedReason, setSelectedReason] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  //get the page state from the location
  const currentPage = location.state?.page || 1;
  const currentCategory = location.state?.selectedCategoryId || "";

  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) {
        return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  }

  // Fetch like status
  const fetchLikeStatus = async (recipeId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipes/${recipeId}/like-status`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch like status");
      const data = await response.json();
      return data.likeStatus; // true or false
    } catch (error) {
      console.error(error.message);
      return false;
    }
  };

  // Fetch bookmark status
  const fetchBookmarkStatus = async (recipeId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipes/${recipeId}/bookmark-status`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch bookmark status");
      const data = await response.json();
      return data.bookmarkStatus; // true or false
    } catch (error) {
      console.error(error.message);
      return false;
    }
  };

  // useEffect to fetch recipe and statuses
  useEffect(() => {
    const getRecipe = async () => {
      try {
        const data = await fetchRecipe(id); // Call the imported fetchRecipe function
        setRecipe(data);
        setComments(data.comments || []);

        // Fetch like and bookmark statuses
        const [likeStatus, bookmarkStatus] = await Promise.all([
          fetchLikeStatus(id),
          fetchBookmarkStatus(id),
        ]);

        setLiked(likeStatus);
        setBookmarked(bookmarkStatus);
      } catch (error) {
        console.error("Failed to fetch recipe or statuses", error);
      }
    };

    getRecipe();
  }, [id]);

  const handleToggleLike = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipes/${recipe.recipeId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to toggle like");
      const data = await response.json(); // Parse the response
      // Update state using the API response
      setLiked(data.likeStatus); // Set the like status from the response
      setRecipe((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          likes: data.likeCount, // Update the like count from the response
        },
      }));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipes/${recipe.recipeId}/bookmarks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to toggle bookmark");
      const data = await response.json(); // Parse the response
      // Update state using the API response
      setBookmarked(data.bookmarkStatus); // Set the bookmark status from the response
      setRecipe((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          bookmarks: data.bookmarkCount, // Update the bookmark count from the response
        },
      }));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipes/${recipe.recipeId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        }
      );

      if (!response.ok) throw new Error("Failed to post comment");

      const postedComment = await response.json();
      setComments([...comments, postedComment]); // Append the new comment to the state
      setNewComment(""); // Clear the input field
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleReportRecipe = async (reason) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipes/${recipe.recipeId}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to report recipe");
      }

      alert("Recipe reported successfully.");
    } catch (error) {
      console.error(error.message);
      alert(error.message || "Failed to report recipe.");
    }
  };

  const handleReportComment = async (commentId, reason) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/${commentId}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) throw new Error("Failed to report comment");

      alert("Comment reported successfully.");
    } catch (error) {
      console.error(error.message);
      alert("Failed to report comment.");
    }
  };

  if (!recipe) return <p>Loading...</p>;

  return (
    <div id="recipeComponent">
      <div id="recipeHeaderContainer">
        <div id="recipeHeaderImg">
          <img
            src={recipe.recipeUrl}
            className="image"
            alt={recipe.title}
            loading="lazy"
          />
        </div>
        <div id="recipeHeaderInfo">
          <h2 className="header">{recipe.title}</h2>
          {/*Author profile - UPDATED*/}
          <div id="authorInfo">
            <Link to={`/author/${recipe.user.userId}`}>
              <div id="authorDetails">
                <div>
                  <p>
                    by <strong>{recipe.user.name}</strong>
                  </p>
                </div>
              </div>
            </Link>
            <FollowButton authorId={recipe.user.userId} />
          </div>
          <p>{recipe.description}</p>
          <p>Serving Size: {recipe.servingSize}</p>
          <div id="recipeIconContainer">
            <button className="recipeIcon" onClick={handleToggleLike}>
              <img
                src={
                  liked
                    ? "../src/assets/likesIconFilled.png"
                    : "../src/assets/likesIcon.png"
                }
                alt={liked ? "Liked" : "Like"}
              />
              {recipe._count.likes}
            </button>

            <button className="recipeIcon" onClick={handleToggleBookmark}>
              <img
                src={
                  bookmarked
                    ? "../src/assets/bookmarksIconFilled.png"
                    : "../src/assets/bookmarksIcon.png"
                }
                alt={bookmarked ? "Bookmarked" : "Bookmark"}
              />
              {recipe._count.bookmarks}
            </button>

            {/* Report Button with Conditional Dropdown */}
            <div id="reportRecipeContainer">
              {!showReportDropdown ? (
                <button
                  className="recipeIcon"
                  onClick={() => setShowReportDropdown(true)} // Show the dropdown on click
                  title="Report this recipe"
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: "0",
                  }}
                >
                  <img
                    src="../src/assets/report-flag.png"
                    alt="Report"
                    style={{ width: "20px", height: "20px" }}
                  />
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    style={{ marginRight: "10px" }}
                  >
                    <option value="" disabled>
                      Select a reason
                    </option>
                    <option value="Inappropriate content">
                      Inappropriate content
                    </option>
                    <option value="Spam">Spam</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Other">Other</option>
                  </select>
                  <button
                    onClick={() => {
                      if (selectedReason) {
                        handleReportRecipe(selectedReason);
                        setShowReportDropdown(false); // Hide the dropdown after reporting
                      } else {
                        alert("Please select a reason before reporting.");
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      background: "none",
                      border: "1px solid #ccc",
                      padding: "5px",
                    }}
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowReportDropdown(false)} // Cancel and hide dropdown
                    style={{
                      cursor: "pointer",
                      background: "none",
                      border: "1px solid #ccc",
                      padding: "5px",
                      marginLeft: "5px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div id="ingredientsContainer">
        <h3>Ingredients</h3>
        <ul id="ingredientsList">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.quantityAmount} {ingredient.quantityUnit} of{" "}
              {ingredient.ingredientName}
            </li>
          ))}
        </ul>
      </div>
      <h3 className="recipeSpace">Directions</h3>
      <div id="stepsListContainer">
        {Array.isArray(recipe.steps) && recipe.steps.length > 0 ? (
          <ol id="stepsList">
            {recipe.steps.map((step) => (
              <li key={step.stepNumber}>
                <strong>Step {step.stepNumber}:</strong> {step.instruction}
              </li>
            ))}
          </ol>
        ) : (
          <p>No steps available for this recipe.</p>
        )}
      </div>
      <div id="commentsContainer">
        <h3 className="recipeSpace">Comments</h3>
        {comments && comments.length > 0 ? (
          <ul id="commentsList">
            {comments.map((comment, index) => (
              <li key={index}>
                <p className="commentSpace">
                  <Link to={`/author/${comment.user.userId}`}>
                    <strong>{comment.user.name}</strong>
                  </Link>
                  - {timeAgo(comment.createdAt)}
                  
                  {/* Report Comment with Conditional Dropdown */}
                  <div>
                    {!commentDropdownVisible[comment.id] ? (
                      <img
                        src="../src/assets/report-flag.png"
                        alt="Report icon"
                        title="Report this comment"
                        className="reportIcon"
                        onClick={() =>
                          setCommentDropdownVisible((prev) => ({
                            ...prev,
                            [comment.id]: true, // Show dropdown for this comment
                          }))
                        }
                        style={{
                          cursor: "pointer",
                          width: "auto",
                          height: "18px",
                          marginTop: "3px",
                        }}
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <select
                          value={comment.selectedReason || ""}
                          onChange={(e) =>
                            setComments((prev) =>
                              prev.map((c) =>
                                c.id === comment.id
                                  ? { ...c, selectedReason: e.target.value }
                                  : c
                              )
                            )
                          }
                          style={{ marginRight: "10px" }}
                        >
                          <option value="" disabled>
                            Select a reason
                          </option>
                          <option value="Inappropriate content">
                            Inappropriate content
                          </option>
                          <option value="Spam">Spam</option>
                          <option value="Harassment">Harassment</option>
                          <option value="Other">Other</option>
                        </select>
                        <button
                          onClick={() => {
                            if (comment.selectedReason) {
                              handleReportComment(
                                comment.id,
                                comment.selectedReason
                              );
                              setCommentDropdownVisible((prev) => ({
                                ...prev,
                                [comment.id]: false, // Hide the dropdown for this comment
                              }));
                            } else {
                              alert("Please select a reason before reporting.");
                            }
                          }}
                          style={{
                            cursor: "pointer",
                            background: "none",
                            border: "1px solid #ccc",
                            padding: "5px",
                          }}
                        >
                          Submit
                        </button>
                        <button
                          onClick={() =>
                            setCommentDropdownVisible((prev) => ({
                              ...prev,
                              [comment.id]: false, // Cancel and hide dropdown
                            }))
                          }
                          style={{
                            cursor: "pointer",
                            background: "none",
                            border: "1px solid #ccc",
                            padding: "5px",
                            marginLeft: "5px",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </p>
                <p className="commentText">{comment.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet.</p>
        )}
        <div id="commentSection">
          <h3>Add a Comment</h3>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
            ></textarea>
            <button className="recipeBtn" type="submit">
              Post Comment
            </button>
          </form>
        </div>
      </div>
      {/* Back to Recipe List Button */}
      <button
        className="recipeBtn"
        onClick={() =>
          navigate(`/?page=${currentPage}`, {
            state: { selectedCategoryId: currentCategory, page: currentPage },
          })
        }
      >
        Back to Recipes
      </button>
    </div>
  );
};

export default Recipe;

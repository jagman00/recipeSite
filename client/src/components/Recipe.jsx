import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchRecipe } from "../API/index.js";

const Recipe = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const getRecipe = async () => {
      try {
        const data = await fetchRecipe(id); // Call the imported fetchRecipe function
        setRecipe(data);
        setComments(data.comments || []);
        setLiked(data.userHasLiked || false);
        setBookmarked(data.userHasBookmarked || false);
      } catch (error) {
        console.error("Failed to fetch recipe", error);
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      if (!response.ok) throw new Error("Failed to toggle like");
      setLiked(!liked); // Toggle the like state
      setRecipe((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          likes: liked 
            ? prev._count.likes - 1 
            : prev._count.likes + 1,
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      if (!response.ok) throw new Error("Failed to toggle bookmark");
      setBookmarked(!bookmarked); // Toggle the bookmark state
      setRecipe((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          bookmarks: bookmarked
            ? prev._count.bookmarks - 1
            : prev._count.bookmarks + 1,
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const handleReportComment = async (commentId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/comments/${commentId}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ reason: "Inappropriate content" }),
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
            alt={recipe.title} //alt text for accessibility
            loading="lazy"
          />
        </div>
        <div id="recipeHeaderInfo">
          <h2 className="header">{recipe.title}</h2>
          <p>{recipe.description}</p>
          <p>Serving Size: {recipe.servingSize}</p>
          <div id="recipeIconContainer">
            <button className="recipeIcon" onClick={handleToggleLike}>
              <img src={ liked ? "../src/assets/likesIconFilled.png"
                               : "../src/assets/likesIcon.png"
              } alt={ liked ? "Liked" : "Like"}/>
              {recipe._count.likes}
            </button>
            <button className="recipeIcon" onClick={handleToggleBookmark}>
              <img src={ bookmarked ? "../src/assets/bookmarksIconFilled.png" 
                               : "../src/assets/bookmarksIcon.png"
              } alt={ bookmarked ? "Bookmarked" : "Bookmark"}/>
              {recipe._count.bookmarks}
            </button>
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
                  <strong>{comment.user.name}</strong>
                  - {timeAgo(comment.createdAt)}
                  <img
                  src="../src/assets/report-flag.png" // Use your report icon image path
                  alt="Report icon"
                  title="Report this comment"
                  className="reportIcon"
                  onClick={() => handleReportComment(comment.id)}
                  style={{
                    cursor: "pointer",
                    width: "auto",
                    height: "18px",
                    marginTop: "3px"
                  }}
                />
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
            <button className="recipeBtn" type="submit">Post Comment</button>
          </form>
        </div>
      </div>
      {/* Back to Recipe List Button */}
      <button className="recipeBtn"
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

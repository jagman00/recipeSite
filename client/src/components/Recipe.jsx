import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchRecipe } from "../API/index.js";

const Recipe = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
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
        return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  }

  useEffect(() => {
    const getRecipe = async () => {
      try {
        const data = await fetchRecipe(id);  // Call the imported fetchRecipe function
        setRecipe(data);
      } catch (error) {
        console.error("Failed to fetch recipe", error);
      }
    };

    getRecipe();
  }, [id]);

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
            <p className="recipeIcon"><img src="../src/assets/likesIcon.png" alt="like icon" /> {recipe._count.likes}</p>
            <p className="recipeIcon"><img src="../src/assets/bookmarksIcon.png" alt="like icon" /> {recipe._count.bookmarks}</p>
          </div>
        </div>
      </div>
      <div id="ingredientsContainer">
        <h3>Ingredients</h3>
        <ul id="ingredientsList">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>
              {ingredient.quantityAmount} {ingredient.quantityUnit} of {ingredient.ingredientName}
            </li>
          ))}
        </ul>
      </div>
      <h3 className="recipeSpace">Directions</h3>
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
      <div id="commentsContainer">
        <h3 className="recipeSpace">Comments</h3>
        {recipe.comments && recipe.comments.length > 0 ? (
          <ul id="commentsList">
            {recipe.comments.map((comment, index) => (
              <li key={index}>
                <p className="commentSpace"><strong>{comment.user.name}</strong> - {timeAgo(comment.updatedAt)}</p>
                <p>{comment.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
      {/* Back to Recipe List Button */}
      <button onClick={()=> navigate(`/?page=${currentPage}`,
      {state: {selectedCategoryId: currentCategory, page: currentPage},
      })
    }>Back to Recipes</button>
    </div>
  );
};

export default Recipe;
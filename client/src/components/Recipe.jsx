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
    <div>
      <h2>{recipe.title}</h2>
      <p>{recipe.description}</p>
      <p>Serving Size: {recipe.servingSize}</p>
      {/* <p><img href={recipe.recipeUrl} target="_blank" rel="noopener noreferrer">{recipe.recipeUrl}</img></p> */}
      <img
              src={recipe.recipeUrl}
              className="image"
              alt={recipe.title} //alt text for accessibility
              loading="lazy"
            />
      <h3>Steps</h3>
      <p>{recipe.steps}</p>
      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.quantityAmount} {ingredient.quantityUnit} of {ingredient.ingredientName}
          </li>
        ))}
      </ul>

      <div>
        <p>Likes: {recipe._count.likes}</p>
        <p>Bookmarks: {recipe._count.bookmarks}</p>
      </div>

      <h3>Comments</h3>
      {recipe.comments && recipe.comments.length > 0 ? (
        <ul>
          {recipe.comments.map((comment, index) => (
            <li key={index}>
              <p>{comment.text}</p>
              <p><strong>{comment.user.name}</strong> - {comment.updatedAt}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
        {/* Back to Recipe List Button */}
        <button onClick={()=> navigate(`/?page=${currentPage}`)}>Back to Recipes</button>
    </div>
  );
};

export default Recipe;
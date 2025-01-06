import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Recipe = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/recipes/${id}`);
        console.log(response);
        
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        console.error("Failed to fetch recipe", error);
      }
    };

    fetchRecipe();
  }, [id]);

  if (!recipe) return <p>Loading...</p>;

  return (
    <div>
      <h2>{recipe.title}</h2>
      <p>{recipe.description}</p>
      <p>Serving Size: {recipe.servingSize}</p>
      <p>Recipe URL: <a href={recipe.recipeUrl} target="_blank" rel="noopener noreferrer">{recipe.recipeUrl}</a></p>
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
    </div>
  );
};

export default Recipe;

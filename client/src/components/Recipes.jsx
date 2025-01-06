import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchRecipes } from "../API/index.js";

const RecipesList = () => {
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    const getRecipes = async () => {
      try {
        const data = await fetchRecipes(page);  // Call the imported fetchRecipes function
        setRecipes(data.recipes);
        setTotalPages(Math.ceil(data.recipeCount / 10)); // Assuming the count of recipes is returned
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      }
    };

    getRecipes();
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div>
      <h2>Recipes</h2>
      <div className="recipe-list">
        {recipes.map((recipe) => (
          <div key={recipe.recipeId} className="recipe-item">
            <Link to={`/recipe/${recipe.recipeId}`}>
              <h3>{recipe.title}</h3>
              <img
              src={recipe.recipeUrl}
              className="image"
              loading="lazy"/>
              <p>{recipe.description}</p>
              <p>Likes: {recipe._count.likes}</p>
              <p>Bookmarks: {recipe._count.bookmarks}</p>
            </Link>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span>{`Page ${page} of ${totalPages}`}</span>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default RecipesList;

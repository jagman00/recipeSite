import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchRecipes } from "../API/index.js";

const RecipesList = () => {
  const [recipes, setRecipes] = useState([]);
  //const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  // useEffect(() => { //get page query param from the URL
  //   const queryParams = new URLSearchParams(location.search);
  //   const currentPage = parseInt(queryParams.get('page'), 10 || 1);
  //   setPage(currentPage > 0 ? currentPage: 1); //defaults to 1 if 'currentPage' is invalid
  // }, [location.search]);

  // Extract page from query parameter
  const getPageFromQuery = () => {
    const queryParams = new URLSearchParams(location.search);
    const pageFromQuery = parseInt(queryParams.get('page'), 10);
    return pageFromQuery > 0 ? pageFromQuery : 1; // Default to 1 if invalid
  };

  const [page, setPage] = useState(getPageFromQuery());

  useEffect(() => {
    //update page state when the URL query changes
    setPage(getPageFromQuery());
  }, [location.search]);

  useEffect(() => {
    const getRecipes = async () => {
      try {
        const data = await fetchRecipes(page);  // Call the imported fetchRecipes function
        setRecipes(data.recipes);
        setTotalPages(Math.ceil(data.recipeCount / 10)); // calculate total pages
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      }
    };
    getRecipes();
  }, [page]);


  const handleNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      navigate(`?page=${nextPage}`); // Update the URL
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      const previousPage = page - 1;
      navigate(`?page=${previousPage}`); // Update the URL
    }
  };

  return (
    <div>
      <h2>Recipes</h2>
      <div className="recipe-list">
        {recipes.map((recipe) => (
          <div key={recipe.recipeId} className="recipe-item">
            <Link to={`/recipe/${recipe.recipeId}`} state={{ page }}>
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

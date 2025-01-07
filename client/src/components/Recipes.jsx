import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchRecipes } from "../API/index.js";
import { fetchCategories } from "../API/index.js";
import { fetchCategoryById } from "../API/index.js";

const RecipesList = () => {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
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

  //update page state when the URL query changes
  useEffect(() => {
    setPage(getPageFromQuery());
  }, [location.search]);

  useEffect(() => {
    const getRecipes = async () => {
      try {
        if (selectedCategoryId) {
          const data = await fetchCategoryById(selectedCategoryId);
          setRecipes(data.recipes);
          setTotalPages(1); // resets pagination for filtered results
        } else {
        const data = await fetchRecipes(page);  // Call the imported fetchRecipes function
        setRecipes(data.recipes);
        setTotalPages(Math.ceil(data.recipeCount / 10)); // calculate total pages
      } 
    } catch (error) {
        console.error("Failed to fetch recipes", error);
      }
    };
    getRecipes();
  }, [page, selectedCategoryId]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        //console.log('data:', data);
        setCategories(data);
        //console.log('categories state:',categories);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    getCategories();
  }, []);

  const handleCategoryChange = async (event) => {
    const categoryId = event.target.value; // Get selected category ID
    setSelectedCategoryId(categoryId); // Update state with selected category
  
    if (categoryId) {
      try {
        const data = await fetchCategoryById(categoryId); // Fetch recipes for selected category
        setRecipes(data.recipes); // Update the recipes state
        setTotalPages(1); // Reset pagination for filtered results
      } catch (error) {
        console.error("Failed to fetch recipes by category", error);
      }
    } else {
      // Reset to all recipes if "All Categories" is selected
      try {
        const data = await fetchRecipes(page); // Fetch all recipes
        setRecipes(data.recipes);
        setTotalPages(Math.ceil(data.recipeCount / 10));
      } catch (error) {
        console.error("Failed to fetch all recipes", error);
      }
    }
  };
  
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
    <div className="recipes">
      <h2>Recipes</h2>
            {/* Category Dropdown */}
        <div className="category-filter">
          <label htmlFor="category">Filter by Category:</label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={handleCategoryChange} // Call the updated function//
            >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
          {/*Recipe list */}
      <div className="recipe-list">
        {recipes.map((recipe) => (
          <div key={recipe.recipeId} className="recipe-item">
            <Link to={`/recipe/${recipe.recipeId}`} state={{ page }}>
              <h3>{recipe.title}</h3>
              <img
                src={recipe.recipeUrl}
                className="image"
                alt={recipe.title}
                loading="lazy"
              />
              <p>{recipe.description}</p>
              <p>Likes: {recipe._count.likes || 0}</p>
              <p>Bookmarks: {recipe._count.bookmarks}</p>
            </Link>
          </div>
        ))}
        {!selectedCategoryId && (
        <div className="pagination">
          <button onClick={handlePreviousPage} disabled={page === 1}>
            Previous
          </button>
          <span id="paginationNumbers">{`Page ${page} of ${totalPages}`}</span>
          <button onClick={handleNextPage} disabled={page === totalPages}>
            Next
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default RecipesList;

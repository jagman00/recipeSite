import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchRecipes } from "../API/index.js";
import { fetchCategories } from "../API/index.js";
import { fetchCategoryById } from "../API/index.js";

const RecipesList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state from location or fallback to defaults
  const initialCategoryId = location.state?.selectedCategoryId || "";
  const initialPage = location.state?.page || 1;

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch recipes based on selected category and page
  useEffect(() => {
    const getRecipes = async () => {
      try {
        if (selectedCategoryId) {
          const data = await fetchCategoryById(selectedCategoryId);
          setRecipes(data.recipes);
          setTotalPages(1); // Reset pagination for filtered results
        } else {
          const data = await fetchRecipes(page);
          setRecipes(data.recipes);
          setTotalPages(Math.ceil(data.recipeCount / 12));
        }
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      }
    };
    getRecipes();
  }, [page, selectedCategoryId]);

  // Fetch all categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    getCategories();
  }, []);

  // Handle category change
  const handleCategoryChange = async (event) => {
    const categoryId = event.target.value;
    setSelectedCategoryId(categoryId); // Update state with selected category
    setPage(1); // Reset to the first page

    if (categoryId) {
      try {
        const data = await fetchCategoryById(categoryId);
        setRecipes(data.recipes);
        setTotalPages(1); // Reset pagination for filtered results
      } catch (error) {
        console.error("Failed to fetch recipes by category", error);
      }
    } else {
      // Fetch all recipes if "All Categories" is selected
      try {
        const data = await fetchRecipes(1);
        setRecipes(data.recipes);
        setTotalPages(Math.ceil(data.recipeCount / 12));
      } catch (error) {
        console.error("Failed to fetch all recipes", error);
      }
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      navigate(`?page=${nextPage}`, { state: { selectedCategoryId, page: nextPage } });
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      const previousPage = page - 1;
      setPage(previousPage);
      navigate(`?page=${previousPage}`, { state: { selectedCategoryId, page: previousPage } });
    }
  };

  return (
    <div className="recipes">
      <h2>Recipes</h2>
            {/* Category Dropdown */}
        <div className="category-filter">
          <label htmlFor="category">Filter by Category: </label>
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
            <Link
              to={`/recipe/${recipe.recipeId}`}
              state={{ selectedCategoryId, page }}
            >
              <div id="imgContainer">
                <img
                  src={recipe.recipeUrl}
                  className="image"
                  alt={recipe.title}
                  loading="lazy"
                />
              </div>
              <div id="recipeBar">
                <h3>{recipe.title}</h3>
                <div id="likesAndBookmarks">
                  <p>
                    <img src="../src/assets/likesIcon.png" alt="likes" />{" "}
                    {recipe._count?.likes || 0}
                  </p>
                  <p>
                    <img src="../src/assets/bookmarksIcon.png" alt="bookmarks" />{" "}
                    {recipe._count?.bookmarks || 0}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* Pagination */}
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

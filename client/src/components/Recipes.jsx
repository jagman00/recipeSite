import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchRecipes, fetchCategories, fetchCategoryById } from "../API/index.js";

const RecipesList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract state from location or fallback to defaults
  const searchQuery = location.state?.searchQuery || "";
  const initialCategoryId = location.state?.selectedCategoryId || "";
  const initialPage = location.state?.page || 1;

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

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

  // Fetch recipes
  useEffect(() => {
    const getRecipes = async () => {
      try {
        let data;
        if (selectedCategoryId) {
          data = await fetchCategoryById(selectedCategoryId);
          const filtered = searchQuery
            ? data.recipes.filter((recipe) =>
                recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : data.recipes;
          setRecipes(filtered);
          setTotalPages(1); // No pagination for filtered results
        } else {
          data = await fetchRecipes(page);
          const filtered = searchQuery
            ? data.recipes.filter((recipe) =>
                recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : data.recipes;
          setRecipes(filtered);
          setTotalPages(Math.ceil(data.recipeCount / 12));
        }
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      }
    };
    getRecipes();
  }, [page, selectedCategoryId, searchQuery]);

  // Handle category change
  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategoryId(categoryId);
    setPage(1); // Reset to the first page
    navigate("/", { state: { selectedCategoryId: categoryId, page: 1, searchQuery } });
  };

  // Handle pagination
  const handleNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      navigate("/", { state: { selectedCategoryId, page: nextPage, searchQuery } });
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      const previousPage = page - 1;
      setPage(previousPage);
      navigate("/", { state: { selectedCategoryId, page: previousPage, searchQuery } });
    }
  };

  return (
    <div className="recipes">
      <h2>Recipes</h2>

      {/* Category Dropdown */}
      <div className="category-filter">
        <label htmlFor="category">Filter by Category: </label>
        <select id="category" value={selectedCategoryId} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.categoryName}
            </option>
          ))}
        </select>
      </div>

      {/* Recipe List */}
      <div className="recipe-list">
        {recipes.map((recipe) => (
          <div key={recipe.recipeId} className="recipe-item">
            <Link
              to={`/recipe/${recipe.recipeId}`}
              state={{ selectedCategoryId, page, searchQuery }}
            >
              <div id="imgContainer">
                <img
                  src={recipe.recipeUrl.includes("https") 
                    ? recipe.recipeUrl
                    :`http://localhost:3000${recipe.recipeUrl}`}
                  className="image"
                  alt={recipe.title}
                  loading="lazy"
                />
              </div>
              <div id="recipeBar">
              <h3>{recipe.title}</h3>
              <div id="likesAndBookmarks">
                <p>
                  <img src="../src/assets/likesIcon.png" alt="likes" /> {recipe._count?.likes || 0}
                </p>
                <p>
                  <img src="../src/assets/bookmarksIcon.png" alt="bookmarks" /> {recipe._count?.bookmarks || 0}
                </p>
              </div>
            </div>
            </Link>
          </div>
        ))}

        {/* Pagination */}
        {!selectedCategoryId && !searchQuery && (
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

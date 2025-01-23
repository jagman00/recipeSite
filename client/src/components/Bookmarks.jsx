import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { fetchBookmarkedRecipes } from "../API/index.js";
import { jwtDecode } from "jwt-decode";

const Bookmarks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPage = location.state?.page || 1;

  const token = localStorage.getItem("token");

  const [userId, setUserId] = useState(null);

  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const getLoggedInUserId = () => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      setUserId(null);
    }
  };

  useEffect(() => {
    getLoggedInUserId();
  }, []);

  useEffect(() => {
    const getBookmarkedRecipes = async () => {
      try {
        const data = await fetchBookmarkedRecipes(userId, token, page);
        setBookmarkedRecipes(data.recipes);
        setTotalPages(Math.ceil(data.bookmarkCount / 12));
      } catch (error) {
        console.error("Failed to fetch bookmarked recipes", error);
      }
    };

    if (userId) {
      getBookmarkedRecipes();
    }
  }, [userId, token, page, bookmarkedRecipes.length]);

  // Handle pagination
  const handleNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      navigate(`?page=${nextPage}`, { state: { page: nextPage } });
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      const previousPage = page - 1;
      setPage(previousPage);
      navigate(`?page=${previousPage}`, { state: { page: previousPage } });
    }
  };

  const handleRemoveBookmark = async (recipeId) => {
    try {
        const response = await fetch(`http://localhost:3000/api/recipes/${recipeId}/bookmarks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            });
            
            if (!response.ok) {
                throw new Error("Failed to remove your bookmark");
            }

      setBookmarkedRecipes(
        bookmarkedRecipes.filter((recipe) => recipe.recipeId !== recipeId)
      );
    } catch (error) {
      console.error("Failed to remove bookmark", error);
    }
  }


  return (
    <div className="recipes">
      <h1>Bookmarked Recipes</h1>
      {bookmarkedRecipes.length ? null : (
        <h3>
          You have no bookmarked recipes yet. Start saving your favorite
          recipes!
        </h3>
      )}

      <div className="recipe-list">
        {bookmarkedRecipes.map((recipe) => (
          <div key={recipe.recipeId} className="recipe-card">
            <Link
              to={`/recipe/${recipe.recipeId}`}
              state={{ page }}
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
            </Link>

            <div id="recipeBookmarkBar">
                <h3>{recipe.title}</h3>
                <button onClick={() => handleRemoveBookmark(recipe.recipeId)}
                id="removeBookmarkBtn">Remove Bookmark</button>
            </div>
          </div>
        ))}

        {/* Pagination */}
        {
          <div className="pagination">
            <button onClick={handlePreviousPage} disabled={page === 1}>
              Previous
            </button>
            <span id="paginationNumbers">{`Page ${page} of ${totalPages}`}</span>
            <button onClick={handleNextPage} disabled={page === totalPages}>
              Next
            </button>
          </div>
        }
      </div>
    </div>
  );
};

export default Bookmarks;

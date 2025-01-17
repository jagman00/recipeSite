import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. User must be logged in.");
        setActivities([]);
        return;
      }

      const response = await fetch("/api/activity-feed", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch activities: ${response.statusText}`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("User is not authenticated.");
        return;
      }

      const response = await fetch("/api/activity-feed/unliked-recipes", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch unliked recipes.");
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching unliked recipes:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div id="userContainer" className="activity-feed">
      <h2>Latest Activity</h2>
      {activities.length === 0 ? (
        <p>No recent activity to display.</p>
      ) : (
        <ul>
          {activities.map((activity) => (
            <li key={activity.id}>
              <Link to={`/recipe/${activity.recipe?.recipeId}`} className="activity-link">
                <div className="activity-item">
                  <img
                    src={activity.recipe?.recipeUrl || "/placeholder-image.png"}
                    alt={activity.recipe?.title || "Recipe Image"}
                    className="activity-image"
                  />
                  <div>
                    <strong>{activity.user?.name || "Unknown User"}</strong>
                    {renderActivityDetails(activity)}
                  </div>
                </div>
              </Link>
              <small>{new Date(activity.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
      <div className="recommendations">
        <h3>Unliked Recipes You Might Like</h3>
        {recommendations.length === 0 ? (
          <p>No recommendations available at the moment.</p>
        ) : (
          <ul>
            {recommendations.map((recipe) => (
              <li key={recipe.recipeId}>
                <Link to={`/recipe/${recipe.recipeId}`}>
                  <img src={recipe.recipeUrl.includes("https")? recipe.recipeUrl:`http://localhost:3000${recipe.recipeUrl}` } alt={recipe.title} />
                  <h4>{recipe.title}</h4>
                  <p>By {recipe.user?.name || "Unknown Author"}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


function renderActivityDetails(activity) {
  const { type, recipe, comment } = activity;

  switch (type) {
    case "like":
      return <> liked <em>{recipe?.title || "a recipe"}</em></>;
    case "comment":
      return (
        <>
          commented on <em>{recipe?.title || "a recipe"}</em>:{" "}
          <q>{comment?.text || "No comment text"}</q>
        </>
      );
    case "bookmark":
      return <> bookmarked <em>{recipe?.title || "a recipe"}</em></>;
    case "new_recipe":
      return <> posted a new recipe: <em>{recipe?.title || "Untitled Recipe"}</em></>;
    default:
      return null;
  }
}

export default ActivityFeed;

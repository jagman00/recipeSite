import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. User must be logged in.");
          setActivities([]);
          setLoading(false);
          return;
        }

        // Fetch the activity feed from the backend
        const response = await fetch("/api/activity-feed", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        } else {
          console.error(`Failed to fetch activities: ${response.statusText}`);
          setActivities([]);
        }
      } catch (error) {
        console.error("Error fetching activity feed:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

 

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("User is not authenticated.");
          return;
        }

        const response = await fetch("/api/recommendations", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        } else {
          console.error("Failed to fetch recommendations");
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="activity-feed">
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
                    <strong>{activity.user?.name || "Unknown User"}</strong>{" "}
                    {activity.type === "like" && (
                      <>
                        liked <em>{activity.recipe?.title || "a recipe"}</em>
                      </>
                    )}
                    {activity.type === "comment" && (
                      <>
                        commented on <em>{activity.recipe?.title || "a recipe"}</em>:{" "}
                        <q>{activity.comment?.text || "No comment text"}</q>
                      </>
                    )}
                    {activity.type === "bookmark" && (
                      <>
                        bookmarked <em>{activity.recipe?.title || "a recipe"}</em>
                      </>
                    )}
                    {activity.type === "new_recipe" && (
                      <>
                        posted a new recipe:{" "}
                        <em>{activity.recipe?.title || "Untitled Recipe"}</em>
                      </>
                    )}
                  </div>
                </div>
              </Link>
              <small>{new Date(activity.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}

{/* recommendations non-functional. style at your own risk. */}


<div className="recommendations">
        <h3>Recommended Recipes</h3>
        {recommendations.length === 0 ? (
          <p>No recommendations available at the moment.</p>
        ) : (
          <ul>
            {recommendations.map((recipe) => (
              <li key={recipe.recipeId}>
                <Link to={`/recipe/${recipe.recipeId}`}>
                  <img src={recipe.recipeUrl} alt={recipe.title} />
                  <h4>{recipe.title}</h4>
                  <p>{recipe.user?.name || "Unknown Author"}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
}

export default ActivityFeed;
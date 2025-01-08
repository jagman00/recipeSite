import React, { useEffect, useState } from "react";
import "../App.css";

function AdminDashboard() {
  // State variables
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [monthlyRegistrations, setMonthlyRegistrations] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topRecipes, setTopRecipes] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [serverHealth, setServerHealth] = useState("Online");
  const [errorLogs, setErrorLogs] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Group users by month
  const groupByMonth = (users) => {
    const counts = {};
    const currentMonth = new Date().toLocaleString("default", {
      month: "short",
    });

    users.forEach((user) => {
      const month = new Date(user.createdAt).toLocaleString("default", {
        month: "short",
      });
      if (month === currentMonth) {
        counts[month] = (counts[month] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([month, count]) => ({ month, count }));
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch Users
        const usersResponse = await fetch("http://localhost:3000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const usersData = await usersResponse.json();
        if (!usersResponse.ok)
          throw new Error(usersData.message || "Failed to fetch users");
        setTotalUsers(usersData.userCount);
        setRecentUsers(usersData.users.slice(0, 5)); // Latest 5 users
        setMonthlyRegistrations(groupByMonth(usersData.users));

        // Fetch Recipes
        const recipesResponse = await fetch(
          "http://localhost:3000/api/recipes?page=1&limit=1"
        );
        const recipesData = await recipesResponse.json();
        if (!recipesResponse.ok)
          throw new Error(recipesData.message || "Failed to fetch recipes");
        setTotalRecipes(recipesData.recipeCount);
        setTopRecipes(recipesData.recipes.slice(0, 5)); // Top 5 recipes

        // Fetch Comments
        const commentsResponse = await fetch(
          "http://localhost:3000/api/comments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const commentsData = await commentsResponse.json();
        if (!commentsResponse.ok)
          throw new Error(commentsData.message || "Failed to fetch comments");
        setRecentComments(commentsData.comments.slice(0, 5)); // Latest 5 comments

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();

    // Periodic Health Check (every 30 seconds)
    const interval = setInterval(() => {
      checkServerHealth();
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Check server health
  const checkServerHealth = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/health");
      const data = await response.json();

      if (data.status === "ok") {
        setServerHealth("Online");
      } else {
        setServerHealth("Issues Detected");
      }
      setErrorLogs(data.logs || ["No errors logged."]); // Use logs dynamically
    } catch (error) {
      setServerHealth("Offline");
      setErrorLogs(["Failed to fetch server logs."]);
    }
  };


  // Create Category
  const createCategory = async () => {
    if (!newCategory.trim()) {
      setCategoryMessage("Category name cannot be empty.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ categoryName: newCategory }),
      });

      if (!response.ok) throw new Error("Failed to create category");

      setCategoryMessage("Category created successfully!");
      setNewCategory("");
    } catch (error) {
      setCategoryMessage(
        "Error creating category. Ensure you have admin privileges."
      );
    }
  };

  // Render loading or error messages
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="adminDashboard">
      <h1>Admin Dashboard</h1>

      {/* Overview Section */}
      <div className="combinedChartContainer">
        <h2>Overview</h2>
        <div className="combinedChart">
          <div className="barRow">
            <span className="barLabel">Users:</span>
            <div className="bar" style={{ width: `${totalUsers * 5}px` }}>
              {totalUsers}
            </div>
          </div>
          <div className="barRow">
            <span className="barLabel">Recipes:</span>
            <div className="bar" style={{ width: `${totalRecipes * 5}px` }}>
              {totalRecipes}
            </div>
          </div>
          {monthlyRegistrations.map((data, index) => (
            <div key={index} className="barRow">
              <span className="barLabel">{data.month}:</span>
              <div className="bar" style={{ width: `${data.count * 5}px` }}>
                {data.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Users */}
      <div className="recentUsers">
        <h2>Recent Registrations</h2>
        {recentUsers.map((user) => (
          <p key={user.userId}>
            {user.name} - {user.email}
          </p>
        ))}
      </div>

      {/* Top Recipes */}
      <div className="topRecipes">
        <h2>Top Recipes</h2>
        {topRecipes.map((recipe) => (
          <p key={recipe.recipeId}>{recipe.title}</p>
        ))}
      </div>

      {/* Recent Comments */}
      <div className="recentComments">
        <h2>Recent Comments</h2>
        {recentComments.map((comment) => (
          <p key={comment.id}>{comment.text}</p>
        ))}
      </div>

      {/* System Health */}
      <div className="systemHealth">
        <h2>System Health</h2>
        <p>Status: {serverHealth}</p>
        <h3>Error Logs:</h3>
        {errorLogs.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>

      {/* Create New Category */}
      <div className="createCategoryContainer">
        <h2>Create New Category</h2>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter category name"
        />
        <button onClick={createCategory}>Create Category</button>
        {categoryMessage && <p>{categoryMessage}</p>}
      </div>
    </div>
  );
}

export default AdminDashboard;

import React, { useEffect, useState } from "react";
import "../App.css";

function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [monthlyRegistrations, setMonthlyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");

  // Group users by month
  const groupByMonth = (users) => {
    const counts = {};
    users.forEach((user) => {
      const month = new Date(user.createdAt).toLocaleString("default", {
        month: "short",
      });
      counts[month] = (counts[month] || 0) + 1;
    });

    return Object.entries(counts).map(([month, count]) => ({ month, count }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total users
        const usersResponse = await fetch("http://localhost:3000/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const usersData = await usersResponse.json();
        if (!usersResponse.ok)
          throw new Error(usersData.message || "Failed to fetch users");
        setTotalUsers(usersData.userCount);
        setMonthlyRegistrations(groupByMonth(usersData.users));

        // Fetch total recipes
        const recipesResponse = await fetch(
          "http://localhost:3000/api/recipes?page=1&limit=1"
        );
        const recipesData = await recipesResponse.json();
        if (!recipesResponse.ok)
          throw new Error(recipesData.message || "Failed to fetch recipes");
        setTotalRecipes(recipesData.recipeCount);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Create new category function
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
      setNewCategory(""); // Clear input field
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
      <div className="combinedChartContainer">
        <h1 className="header">Admin Dashboard</h1>
        <h2>Overview</h2>
        <div className="combinedChart">
          {/* Total Users */}
          <div className="barRow">
            <span className="barLabel">Registered Users</span>
            <div className="bar" style={{ width: `${totalUsers * 5}px` }}>
              {totalUsers}
            </div>
          </div>

          {/* Total Recipes */}
          <div className="barRow">
            <span className="barLabel">Uploaded Recipes</span>
            <div className="bar" style={{ width: `${totalRecipes * 5}px` }}>
              {totalRecipes}
            </div>
          </div>

          {/* Monthly Registrations */}
          {monthlyRegistrations.map((data, index) => (
            <div key={index} className="barRow">
              <span className="barLabel">Registrations in {data.month}</span>
              <div className="bar" style={{ width: `${data.count * 5}px` }}>
                {data.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Category Section */}
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

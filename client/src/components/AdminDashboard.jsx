import React, { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  // Existing state variables
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
  const navigate = useNavigate();
  const [reportedRecipes, setReportedRecipes] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); 
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState(""); 
  const [allUsers, setAllUsers] = useState([]);

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

   // Fetch all users alphabetically
   const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch users");

      // Sort users alphabetically by name
      const sortedUsers = data.users.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setAllUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }; 

  // Toggle admin status
  const toggleAdminStatus = async (userId, isAdmin) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}/toggle-admin`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isAdmin: !isAdmin }),
        }
      );

      if (!response.ok) throw new Error("Failed to update admin status");

      // Update local state
      setAllUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userId === userId ? { ...user, isAdmin: !isAdmin } : user
        )
      );
    } catch (error) {
      console.error("Error toggling admin status:", error);
    }
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

        // Fetch Reported Recipes
        const reportedRecipesResponse = await fetch(
          "http://localhost:3000/api/reports/recipes",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const reportedRecipesData = await reportedRecipesResponse.json();
        setReportedRecipes(reportedRecipesData.reports);

        // Fetch Reported Comments
        const reportedCommentsResponse = await fetch(
          "http://localhost:3000/api/reports/comments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const reportedCommentsData = await reportedCommentsResponse.json();
        setReportedComments(reportedCommentsData.reports);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();

    // Periodic Health Check
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
      setErrorLogs(data.logs || ["No errors logged."]);
    } catch (error) {
      setServerHealth("Offline");
      setErrorLogs(["Failed to fetch server logs."]);
    }
  };

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

  useEffect(() => {

    fetchAllUsers();

    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/contact");
        if (!response.ok) throw new Error("Failed to fetch messages.");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  const handleDeleteMessage = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/contact/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to delete message.");

        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== id)
        );
        alert("Message deleted successfully.");
      } catch (error) {
        console.error("Error deleting message:", error);
        alert("Failed to delete message. Please try again.");
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/categories");
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch categories");
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch categories when the component loads
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditCategory = async (id) => {
    if (!editingCategoryName.trim()) {
      alert("Category name cannot be empty.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/categories/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ categoryName: editingCategoryName }),
        }
      );

      if (!response.ok) throw new Error("Failed to update category");

      // Update the local state
      setCategories((prev) =>
        prev.map((category) =>
          category.id === id
            ? { ...category, categoryName: editingCategoryName }
            : category
        )
      );
      setEditingCategoryId(null);
      setEditingCategoryName("");
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete category");

      // Update the local state
      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleDismissRecipeReport = async (reportId) => {
    if (
      window.confirm("Are you sure you want to dismiss this recipe report?")
    ) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/reports/recipes/${reportId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to dismiss recipe report.");

        // Update state to remove the dismissed report
        setReportedRecipes((prevReports) =>
          prevReports.filter((report) => report.reportId !== reportId)
        );
        alert("Recipe report dismissed successfully.");
      } catch (error) {
        console.error("Error dismissing recipe report:", error);
        alert("Failed to dismiss recipe report. Please try again.");
      }
    }
  };

  const handleDismissCommentReport = async (reportId) => {
    if (
      window.confirm("Are you sure you want to dismiss this comment report?")
    ) {
      try {
        const response = await fetch(
          `http://localhost:3000/api/reports/comments/${reportId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to dismiss comment report.");

        // Update state to remove the dismissed report
        setReportedComments((prevReports) =>
          prevReports.filter((report) => report.reportId !== reportId)
        );
        alert("Comment report dismissed successfully.");
      } catch (error) {
        console.error("Error dismissing comment report:", error);
        alert("Failed to dismiss comment report. Please try again.");
      }
    }
  };
  // Render loading or error messages
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="adminDashboardComponent">
      <h1 id="adminHeader">Admin Dashboard</h1>
      <div className="adminDashboard">
        <div className="combinedChartContainer adminCard">
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
        <div className="recentUsers adminCard">
          <h2>Recent Registrations</h2>
          {recentUsers.map((user) => (
            <p key={user.userId}>
              {user.name} - {user.email}
            </p>
          ))}
        </div>
        {/* Top Recipes */}
        <div className="topRecipes adminCard">
          <h2>Top Recipes</h2>
          {topRecipes.map((recipe) => (
            <p key={recipe.recipeId}>{recipe.title}</p>
          ))}
        </div>
        {/* Recent Comments */}
        <div className="recentComments adminCard">
          <h2>Recent Comments</h2>
          {recentComments.map((comment) => (
            <p key={comment.id}>{comment.text}</p>
          ))}
        </div>
        {/* System Health */}
        <div className="systemHealth adminCard">
          <h2>System Health</h2>
          <p>Status: {serverHealth}</p>
          <h3>Error Logs:</h3>
          {errorLogs.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </div>

        {/* Create New Category */}
        <div className="createCategoryContainer adminCard">
          <h2>Create New Category</h2>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
          />
          <button onClick={createCategory}>Create Category</button>
          {categoryMessage && (
            <p className="categoryMessage">{categoryMessage}</p>
          )}

          {/* Manage Categories Dropdown */}
          <div className="manageCategoriesDropdown">
            <h3>Manage Existing Categories</h3>
            <select
              value={selectedCategoryId || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedCategory = categories.find(
                  (category) => category.id === parseInt(selectedId, 10)
                );
                setSelectedCategoryId(selectedId);
                setEditingCategoryId(selectedId);
                setEditingCategoryName(selectedCategory?.categoryName || "");
              }}
            >
              <option value="" disabled>
                Select a category to manage
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>

            {editingCategoryId && (
              <div id="manageCategoriesContainer">
                <input
                  type="text"
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  placeholder="Edit category name"
                />
                <button onClick={() => handleEditCategory(editingCategoryId)}>
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingCategoryId(null);
                    setEditingCategoryName("");
                    setSelectedCategoryId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="deleteButton"
                  onClick={() => handleDeleteCategory(editingCategoryId)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reported Recipes */}
        <div className="reportedRecipes adminCard">
          <h2>Reported Recipes</h2>
          {Array.isArray(reportedRecipes) && reportedRecipes.length > 0 ? (
            <ul>
              {reportedRecipes.slice(0, 3).map((report) => (
                <li key={report.reportId} className="reported-item">
                  <p>
                    <strong>Recipe:</strong>{" "}
                    <span
                      className="highlighted-text"
                      onClick={() =>
                        navigate(`/recipe/${report.recipe?.recipeId}`)
                      }
                    >
                      {report.recipe?.title || "Unknown Recipe"}
                    </span>{" "}
                    (ID: {report.recipe?.recipeId || "N/A"})
                  </p>
                  <p>
                    <strong>Reported By:</strong>{" "}
                    {report.reporter?.name || "Unknown"} (
                    {report.reporter?.email || "N/A"})
                  </p>
                  <p>
                    <strong>Reason:</strong>{" "}
                    {report.reason || "No reason provided"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleString()
                      : "Unknown Date"}
                  </p>
                  <button
                    onClick={() => handleDismissRecipeReport(report.reportId)}
                    className="dismissButton"
                  >
                    Dismiss
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reported recipes.</p>
          )}
        </div>

        {/* Reported Comments */}
        <div className="reportedComments adminCard">
          <h2>Reported Comments</h2>
          {Array.isArray(reportedComments) && reportedComments.length > 0 ? (
            <ul>
              {reportedComments.slice(0, 3).map((report) => (
                <li key={report.reportId} className="reported-item">
                  <p>
                    <strong>Comment:</strong>{" "}
                    <span
                      className="highlighted-text"
                      onClick={() =>
                        navigate(
                          `/recipe/${report.comment?.recipeId}#comment-${report.comment?.id}`
                        )
                      }
                    >
                      {report.comment?.text || "Unknown Comment"}
                    </span>{" "}
                    (ID: {report.comment?.id || "N/A"})
                  </p>
                  <p>
                    <strong>Reported By:</strong>{" "}
                    {report.reporter?.name || "Unknown"} (
                    {report.reporter?.email || "N/A"})
                  </p>
                  <p>
                    <strong>Reason:</strong>{" "}
                    {report.reason || "No reason provided"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleString()
                      : "Unknown Date"}
                  </p>
                  <button
                    onClick={() => handleDismissCommentReport(report.reportId)}
                    className="dismissButton"
                  >
                    Dismiss
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reported comments.</p>
          )}
        </div>
      </div>
      {/* Contact Message */}
      <div className="adminDashboard">
        <div className="contactMessageContainer">
          <h2>Contact Messages</h2>
          <ul className="contactMessageList">
            {messages.map((message) => (
              <li key={message.id}>
                <p>
                  <strong>Name:</strong> {message.name}
                </p>
                <p>
                  <strong>Email:</strong> {message.email}
                </p>
                <p>
                  <strong>Message:</strong> {message.message}
                </p>
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="contactMessagedeleteButton"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* New Users List Section */}
      <div className="allUsers adminCard">
        <h2>All Users</h2>
        <div className="usersListContainer">
          <ul className="usersList">
            {allUsers.map((user) => (
              <li key={user.userId} className="userItem">
                <span>{user.name}</span> -<span>{user.email}</span> -
                <span>
                  <button
                    className={`toggleAdminButton ${
                      user.isAdmin ? "remove" : "make"
                    }`}
                    onClick={() => toggleAdminStatus(user.userId, user.isAdmin)}
                  >
                    {user.isAdmin ? "Remove Admin" : "Make Admin"}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

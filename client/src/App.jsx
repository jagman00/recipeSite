import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Recipe from "./components/Recipe";
import Recipes from "./components/Recipes";
import Register from "./components/Register";
import User from "./components/User";
import Bookmarks from "./components/Bookmarks";
import AdminDashboard from "./components/AdminDashboard";
import NewRecipe from "./components/NewRecipe";
import AuthorProfile from "./components/AuthorProfile";
import Notifications from "./components/Notifications";
import Contact from "./components/Contact";  // Import Contact component
import "./App.css";
import { jwtDecode } from "jwt-decode";
import "./responsive.css";
import EditRecipe from "./components/EditRecipe";

function App() {
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 < Date.now()) {
          localStorage.clear();
          setToken(null);
          setIsAdmin(false);
          return;
        }
        setToken(token);
        setIsAdmin(decodedUser.isAdmin || false);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.clear();
        setToken(null);
        setIsAdmin(false);
      }
    } else {
      setToken(null);
    }
  }, []);

  const navbarKey = token ? `${token}-${isAdmin}` : "no-token";

  return (
    <div className="background">
      <Router>
        <Navbar
          key={navbarKey}
          token={token}
          setToken={(newToken) => {
            setToken(newToken);
            if (newToken) {
              try {
                const decodedUser = jwtDecode(newToken);
                setIsAdmin(decodedUser.isAdmin || false);
              } catch {
                setIsAdmin(false);
              }
            } else {
              setIsAdmin(false);
            }
          }}
          isAdmin={isAdmin}
        />
        <main>
          <Routes>
            <Route path="/user" element={<User setToken={setToken} />} />
            {isAdmin && <Route path="/admin" element={<AdminDashboard />} />}
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route
              path="/register"
              element={<Register setToken={setToken} />}
            />
            <Route path="/recipe/:id" element={<Recipe />} />
            <Route path="/edit-recipe/:id" element={<EditRecipe />} />
            <Route path="/" element={<Recipes />} />
            <Route path="/new-recipe" element={<NewRecipe />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/author/:authorId" element={<AuthorProfile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<div>Page Not Found</div>} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;

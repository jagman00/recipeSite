const API_URL = "http://localhost:3000/api"


//register new user
export async function fetchRegister(name, email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            throw new Error("Registeration Error!");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }
}

//login user
export async function fetchLogin(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error("Login Error!");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
    }
}

//get user info page
export async function fetchUser(token) {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });
        const result = await response.json();
        return result;
    } catch (error) { 
        console.error(error);        
    }
}

//update user info for edit profile page
export const updateUser = async (userId, updatedProfile) => {
  try {
    const token = localStorage.getItem("token"); // Retrieve the authentication token
    if (!token) {
      throw new Error("No authentication token found.");
    }

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT", // Use PATCH as defined in the backend route
      headers: {
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProfile), // Send the updated profile data as JSON
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user profile.");
    }

    const responseData = await response.json(); // Parse and return the updated user data
    return responseData;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};


// fetch all recipes
export const fetchRecipes = async (page, limit = 12) => {
    try {
      const response = await fetch(`${API_URL}/recipes?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in fetchRecipes:', error);
      throw error;
    }
  };

  //fetch a single recipe by id
  export const fetchRecipe = async (id) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch recipe", error);
      throw error; // Re-throw the error so it can be handled in the component
    }
  };

  //fetch categories 
  export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/categories`);
        //console.log(response);  
        if (!response.ok) {
            throw new Error('Error in fetchCategories');
        }
        const data = await response.json();
        //console.log(data);
        return data.categories;
    } catch (error) {
        console.error('Error in fetchCategories', error);
        throw error;
    }
  };

  //get category by id
  export const fetchCategoryById = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/categories/${categoryId}/recipes`);
      if (!response.ok) {
        throw new Error("Failed to fetch category");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      throw error;
    }
  };
  
  // get all bookmarked recipes of a specific user (owner only)
  export const fetchBookmarkedRecipes = async (userId,token, page, limit =12) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/bookmarks?page=${page}&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookmarks");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      throw error;
    }
  };

// fetch a specific user by id
export const fetchUserById = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
    if (!response.ok) {
      throw new Error("Failed to fetch the user");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

// toggle follow user
export const toggleFollow = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/follow`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to toggle follow user");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error toggling follow user:", error);
    throw error;
  }
};

// fetch follow status
export const fetchFollowStatus = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/follow-status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch follow status");
    }
    const data = await response.json();
    return data.followStatus;
  } catch (error) {
    console.error("Error fetching follow status:", error);
    throw error;
  }
};



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

// fetch all recipes
export const fetchRecipes = async (page, limit = 10) => {
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
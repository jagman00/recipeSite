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

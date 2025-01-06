import React, { useState } from "react";
import PropTypes from 'prop-types';
import { fetchLogin } from "../API/index.js"; // Importing the fetchLogin function
import { Navigate, useNavigate } from "react-router-dom";

const LoginUser = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetchLogin(email, password);
      if (response !== undefined) {
        setSuccessMessage("Login successful!");
        setToken(response);

        // Save the token in localStorage
        localStorage.setItem("token", response); 

        navigate('/user');
      } else {
        setErrorMessage(response?.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("An error occurred during login.");
    }
  };

  return (
    <div>
      <h2>Login User</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            id="email"
            value={email}
            placeholder ='kingArthur@camelot.com'
            onChange={(e) => setEmail(e.target.value)}
            required />
        </div>
        <div>
          <input
            type="password"
            id="password"
            value={password}
            placeholder ='drawbridge passcode'
            onChange={(e) => setPassword(e.target.value)}
            required />
        </div>
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

LoginUser.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default LoginUser;

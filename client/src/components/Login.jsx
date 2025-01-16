import React, { useState } from "react";
import PropTypes from 'prop-types';
import { GoogleLogin } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode";
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

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const decoded = jwtDecode(credential);

      // Extract Google user info
      const googleUser = {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
      };

      // Send Google user info to your backend for registration/login
      const response = await fetchRegister(googleUser.name, googleUser.email, googleUser.googleId);

      if (response) {
        setSuccessMessage("Google login successful!");
        setToken(response);

        // Save the token in localStorage
        localStorage.setItem("token", response);

        navigate('/user');
      } else {
        setErrorMessage("Google login failed.");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      setErrorMessage("An error occurred during Google login.");
    }
  };

  return (
    <div className="loginComponent">
      <h2 className="header">Welcome, Noble Chef!</h2>
      <div className="introText">
        Enter the secret words that grant you passage.
      </div>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">
            <span>Email:</span>
            <input
              type="email"
              id="email"
              value={email}
              placeholder ='kingarthur@camelot.com'
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </label>
        </div>
        <div>
          <label htmlFor="password">
            <span>Password:</span>
            <input
              type="password"
              id="password"
              value={password}
              placeholder ='Drawbridge Passcode'
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </label>
        </div>
        <button type="submit">Login</button>
      </form>

      <div style={{ margin: "20px 0" }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setErrorMessage("Google login failed.")}
          />
      </div>
      
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

LoginUser.propTypes = { //
  setToken: PropTypes.func.isRequired,
};

export default LoginUser;

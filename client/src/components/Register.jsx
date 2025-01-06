import React, { useState } from "react";
import { fetchRegister } from "../API/index.js"; // Importing the fetchRegister function
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

const RegisterUser = ({ setToken }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetchRegister(name, email, password);
      
      if (response !== undefined) {
        setSuccessMessage("User registered successfully!");
        setToken(response);

        // Save the token in localStorage
        localStorage.setItem("token", response); 

        navigate('/user');
      } else {
        setErrorMessage(response?.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      setErrorMessage("An error occurred during registration.");
    }
  };

  return (
    <div className="registerComponent">
      <h2 className="header">Take Your Seat at<br /> the Round Table</h2>
      <div className="introText">
        Step into the grand halls of Camelot,<br /> where recipes are treasures,<br /> and every meal is a quest worth savoring.<br /> Join the round table of culinary legends<br /> and share your feasts with the realm!
      </div>

      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="name">
            <span>Username:</span> 
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Sir Lancelot"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label htmlFor="email">
            <span>Email:</span>
            <input
              type="email"
              id="email"
              value={email}
              placeholder="lancelot44@camelot.com"
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
              placeholder="Your Secret Phrase"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Register</button>
      </form>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

RegisterUser.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default RegisterUser;

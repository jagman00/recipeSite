import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'

import '../App.css'
import React from 'react'
import userIcon from '../assets/UserIcon.png';
import logoIcon from '../assets/RoundTable.png'

function Navbar() {
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
    }

  return (
    <nav className="navbar">

        <Link to='/'>
          <div id="logoContainer">
            <img id="logoIcon" src={logoIcon} alt="Website logo" />
            <span id="logoText">Recipe Round Table</span>
          </div>
        </Link>
        <div id="searchbarContainer">
          <input id="searchbar" type='text'  placeholder='Search for recipes or users'></input>
          <button>Search</button>
        </div>
        {token?
        (
            <>
                <Link id="userIcon" to="/" onClick={()=>handleLogout()}>
                  <div id="userIconContainer">
                    <img src={userIcon} alt="User icon" />
                    <span>Logout</span>
                  </div>
                </Link>
            </>
        )
        :
        (
            <>
                <Link id="userIcon" to='/login'>
                  <div id="userIconContainer">
                    <img src={userIcon} alt="User icon" />
                    <span>Login</span>
                  </div>
                </Link>
                <Link to="/register">Register</Link>
            </>
        )
        }
    </nav>
  )
}

export default Navbar
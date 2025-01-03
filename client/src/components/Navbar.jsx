import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'

import '../App.css'
import React from 'react'



function Navbar() {
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
    }

  return (
    <nav className="navbar">
        <h1>Navbar</h1>
        <Link to='/'>Recipe Round Table</Link>
        <input type='text'  placeholder='Search for recipes or users'></input>
        {token?
        (
            <>
                <Link to='/user'>User</Link>
                <Link to="/" onClick={()=>handleLogout()}>logout</Link>
            </>
        )
        :
        (
            <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </>
        )
        } 
    </nav>
  )
}

export default Navbar
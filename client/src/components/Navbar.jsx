import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'

import '../App.css'
import React from 'react'



function Navbar() {

  return (
    <nav className="navbar">
        <h1>Navbar</h1>
        <Link to='/'>Recipe Round Table</Link>
        <input type='text'  placeholder='Search for recipes or users'></input>
        <Link to='/user'>User</Link>
        
    </nav>
  )
}

export default Navbar
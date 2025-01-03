import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'

import '../App.css'
import React from 'react'



function User() {

  return (
    <div className="user">
        <h1>User</h1>
        <Link to='/register'>Register</Link>
        <Link to='/login'>Login</Link>
        
    </div>
  )
}

export default User
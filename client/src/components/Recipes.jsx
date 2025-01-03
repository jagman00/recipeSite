import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'

import '../App.css'
import React from 'react'



function Recipes() {

  return (
    <div className="recipes">
        <h1>Recipes</h1>
        <Link to='/recipe'>Recipe</Link>
    </div>
  )
}

export default Recipes

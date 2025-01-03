import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Navbar from './components/Navbar'
import Recipe from './components/Recipe'
import Recipes from './components/Recipes'
import Register from './components/Register'
import User from './components/User'
import './App.css'
import React from 'react'


function App() {

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/user" element={<User />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recipe/:id" element={<Recipe />} />
        <Route path="/" element={<Recipes />} />
      </Routes>
    </Router>
  )
}

export default App

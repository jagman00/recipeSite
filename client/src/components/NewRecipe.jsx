import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const NewRecipe = () => {
  const navigate = useNavigate();

  // State for form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [servingSize, setServingSize] = useState(1); // Default serving size
  const [recipeUrl, setRecipeUrl] = useState(""); // State for the image URL
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "", unit: "" }]);
  const [steps, setSteps] = useState([""]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setSteps([...steps, ""]);
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedSteps = steps
    .filter((step) => step.trim()) 
    .map((instruction, index) => ({
      stepNumber: index + 1,
      instruction, 
    }));


    const recipeData = {
        title,
        description,
        servingSize: parseInt(servingSize, 10),
        recipeUrl,
        steps: formattedSteps,
        ingredients: ingredients.map((ingredient) => ({
          ingredientName: ingredient.name,
          quantityAmount: ingredient.quantity.toString(),
          quantityUnit: ingredient.unit,
        })),
      };


      try {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    const response = await fetch("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(recipeData),
    });

    if (response.ok) {
      navigate("/");
    } else {
      const errorData = await response.json();
      console.error("Failed to submit recipe:", errorData);
      alert(errorData.message || "Failed to submit recipe. Please try again.");
    }
  } catch (error) {
    console.error("Error submitting recipe:", error);
    alert("An error occurred while submitting the recipe.");
  }
};

  return (
    <div className="new-recipe-form">
      <h2>Create a New Recipe</h2>
      <form onSubmit={handleSubmit}>
        {/* Recipe Title */}
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter recipe title"
            required
          />
        </div>

        {/* Recipe Description */}
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a brief description"
            required
          />
        </div>

        {/* Serving Size */}
        <div>
          <label htmlFor="servingSize">Serving Size:</label>
          <select
            id="servingSize"
            value={servingSize}
            onChange={(e) => setServingSize(e.target.value)}
            required
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Recipe URL */}
        <div>
          <label htmlFor="recipeUrl">Image URL:</label>
          <input
            id="recipeUrl"
            type="url"
            value={recipeUrl}
            onChange={(e) => setRecipeUrl(e.target.value)}
            placeholder="Enter a URL for the recipe image"
            required
          />
        </div>

        {/* Ingredients */}
        <div>
          <h3>Ingredients</h3>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <input
                type="text"
                placeholder="Ingredient name"
                value={ingredient.name}
                onChange={(e) =>
                  setIngredients(
                    ingredients.map((ing, i) =>
                      i === index ? { ...ing, name: e.target.value } : ing
                    )
                  )
                }
                required
              />
              <input
                type="text"
                placeholder="Quantity"
                value={ingredient.quantity}
                onChange={(e) =>
                  setIngredients(
                    ingredients.map((ing, i) =>
                      i === index ? { ...ing, quantity: e.target.value } : ing
                    )
                  )
                }
                required
              />
              <input
                type="text"
                placeholder="Unit (e.g., cups, tsp)"
                value={ingredient.unit}
                onChange={(e) =>
                  setIngredients(
                    ingredients.map((ing, i) =>
                      i === index ? { ...ing, unit: e.target.value } : ing
                    )
                  )
                }
              />
              <button type="button" onClick={() => handleRemoveIngredient(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddIngredient}>
            Add Ingredient
          </button>
        </div>

        {/* Steps */}
        <div>
          <h3>Steps</h3>
          {steps.map((step, index) => (
            <div key={index} className="step-row">
              <textarea
                placeholder={`Step ${index + 1}`}
                value={step}
                onChange={(e) =>
                  setSteps(steps.map((s, i) => (i === index ? e.target.value : s)))
                }
                required
              />
              <button type="button" onClick={() => handleRemoveStep(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddStep}>
            Add Step
          </button>
        </div>

        {/* Submit Button */}
        <button type="submit">Submit Recipe</button>
      </form>
    </div>
  );
};

export default NewRecipe;

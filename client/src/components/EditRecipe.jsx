import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../App.css";
import { fetchCategories } from "../API";

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    servingSize: "",
    recipeUrl: "",
    ingredients: [{ name: "", quantity: "", unit: "" }],
    steps: [""],
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch recipe.");
        const data = await response.json();
        setRecipe({
          ...data,
          ingredients: data.ingredients.map((ing) => ({
            name: ing.ingredientName,
            quantity: ing.quantityAmount,
            unit: ing.quantityUnit,
          })),
          steps: data.steps.map((step) => step.instruction),
        });
        setSelectedCategory(data.categoryId);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        setError("Failed to load recipe data.");
      }
    };

    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchRecipe();
    loadCategories();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = () => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: "", unit: "" }],
    }));
  };

  const handleRemoveIngredient = (index) => {
    setRecipe((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index][field] = value;
    setRecipe((prev) => ({ ...prev, ingredients: updatedIngredients }));
  };

  const handleAddStep = () => {
    setRecipe((prev) => ({
      ...prev,
      steps: [...prev.steps, ""],
    }));
  };

  const handleRemoveStep = (index) => {
    setRecipe((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...recipe.steps];
    updatedSteps[index] = value;
    setRecipe((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedSteps = recipe.steps
      .filter((step) => step.trim())
      .map((instruction, index) => ({
        stepNumber: index + 1,
        instruction,
      }));

    const recipeData = {
      ...recipe,
      servingSize: parseInt(recipe.servingSize, 10),
      steps: formattedSteps,
      ingredients: recipe.ingredients.map((ingredient) => ({
        ingredientName: ingredient.name,
        quantityAmount: ingredient.quantity.toString(),
        quantityUnit: ingredient.unit,
      })),
      categoryId: selectedCategory,
    };

    try {
      const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        throw new Error("Failed to update recipe.");
      }
      alert("Recipe updated successfully!");
      navigate(`/recipe/${id}`);
    } catch (error) {
      console.error("Error updating recipe:", error);
      setError("Failed to update recipe.");
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="new-recipe-form">
      <h2 className="header">Edit Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">
            Title:
            <input
              id="title"
              type="text"
              name="title"
              value={recipe.title}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label id="newRecipeDescription" htmlFor="description">
            Description:
            <textarea
              id="description"
              name="description"
              value={recipe.description}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label htmlFor="category">
            Category:
            {loadingCategories ? (
              <p>Loading categories...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : (
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>
        <div>
          <label htmlFor="servingSize">
            Serving Size:
            <select
              id="servingSize"
              name="servingSize"
              value={recipe.servingSize}
              onChange={handleChange}
              required
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label htmlFor="recipeUrl">
            Image URL:
            <input
              id="recipeUrl"
              type="url"
              name="recipeUrl"
              value={recipe.recipeUrl}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <h3>Ingredients</h3>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="addIngredientContainer">
              <div className="ingredient-row">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, "name", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                />
              </div>
              {recipe.ingredients.length > 1 && (
                <button
                  id="removeIngredientBtn"
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                >
                  <p>-</p>
                </button>
              )}
            </div>
          ))}
          <button
            id="addIngredientBtn"
            type="button"
            onClick={handleAddIngredient}
          >
            Add Ingredient
          </button>
        </div>
        <div>
          <h3>Steps</h3>
          {recipe.steps.map((step, index) => (
            <div key={index} className="step-row">
              <textarea
                placeholder={`Step ${index + 1}`}
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                required
              />
              {recipe.steps.length > 1 && (
                <button
                id="removeStepBtn"
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveStep(index)}
                >
                  <p>-</p>
                </button>
              )}
            </div>
          ))}
          <button
            id="addStepBtn"
            type="button"
            onClick={handleAddStep}
          >
            Add Step
          </button>
        </div>
        <button 
          id="submitRecipeBtn" 
          type="submit" 
          className="submit-btn"
        >
          Submit Changes
        </button>
      </form>
    </div>
  );
};

export default EditRecipe;

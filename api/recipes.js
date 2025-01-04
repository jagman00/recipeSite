const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

require('dotenv').config();
const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { use } = require("react");
const { comment } = require("../../yarnia.CAPSTONE/prisma");

// Create new recipe by authenticated user /*create ingredients inclusively*/
// POST /api/recipes
router.post("/", authenticateUser, async (req, res, next) => {
    const { title, description, servingSize, recipeUrl, steps } = req.body;

    try {
        const recipe = await prisma.recipe.create({
            data: {
                title,
                description,
                servingSize,
                recipeUrl,
                steps,
                userId: req.user.userId,
                ingredients: {  /* Create related ingredients */ /* Expect an array of ingredient objects*/
                    create: req.body.ingredients.map((ingredient) => ({ 
                        ingredientName: ingredient.ingredientName,
                        quantityAmount: ingredient.quantityAmount,
                        quantityUnit: ingredient.quantityUnit,
                    })),
                }
            },
            include:{ingredients:true},
        });
        res.status(201).json(recipe);
    } catch (error) {
        next(error);
    }
});

// Get all recipes
// GET /api/recipes
router.get("/", async (req, res, next) => {
    try {
        const recipes = await prisma.recipe.findMany({
            include: { /* Include related user details */
                user: {
                    select: {
                        userId: true,
                        name: true,
                        profileUrl: true,
                    },
                },
                _count: { /* Include count of comments, bookmarks, and likes */
                    select: { 
                        comments: true,
                        bookmarks: true,
                        likes: true,
                    }, 
                },
            },

        });
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch recipes" });
    }
});

// Get a single recipe by ID
// GET /api/recipes/:id
router.get("/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const recipe = await prisma.recipe.findUnique({
            where: { recipeId: parseInt(id) },
            include: {
                user: {
                    select: {
                        userId: true,
                        name: true,
                        profileUrl: true,
                        userTitle: true,
                    },
                },
                ingredients: true, /* Include related ingredients */
                _count: { /* Include count of comments, bookmarks, and likes */
                    select: { 
                        bookmarks: true,
                        likes: true,
                    }, 
                },
        }});

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.status(200).json(recipe);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch a recipe" });
    }
});

// Update recipe /*edit ingredients inclusively*/
// PUT /api/recipes/:id
router.put("/:id", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    const { title, description, servingSize, recipeUrl, steps, ingredients } = req.body;

    try {
        const recipe = await prisma.recipe.findUnique({
            where: { recipeId: parseInt(id) },
        });

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        if (recipe.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized to update this recipe" });
        }

        const updatedRecipe = await prisma.recipe.update({
            where: { recipeId: parseInt(id) },
            data: { 
                title, 
                description, 
                servingSize, 
                recipeUrl, 
                steps,
                ingredients: {  /* Update related ingredients */
                    deleteMany: {}, /* Delete all existing ingredients */
                    create: ingredients.map((ingredient) => ({ 
                        ingredientName: ingredient.ingredientName,
                        quantityAmount: ingredient.quantityAmount,
                        quantityUnit: ingredient.quantityUnit,
                    })),
                },
            },
            include:{ingredients:true},
        });

        res.status(200).json(updatedRecipe);
    } catch (error) {
        res.status(500).json({ message: "Failed to update recipe" });
    }
});

// Delete recipe (only by the user or admin)
// DELETE /api/recipes/:id
router.delete("/:id", authenticateUser, async (req, res, next) => {
    const { id } = req.params;

    try {
        const recipe = await prisma.recipe.findUnique({
            where: { recipeId: parseInt(id) },
        });

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        if (recipe.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized to delete this recipe" });
        }

        await prisma.recipe.delete({
            where: { recipeId: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Failed to delete recipe" });
    }
});

// Retrieve all ingredients for a recipe
// GET /api/recipes/:id/ingredients
router.get("/:id/ingredients", async (req, res, next) => {
    const { id } = req.params;
    try {
        const ingredients = await prisma.ingredient.findMany({
            where: { recipeId: parseInt(id) },
        });

        if (!ingredients) {
            return res.status(404).json({ message: "Ingredients not found" });
        }

        res.status(200).json(ingredients);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch ingredients" });
    }
});
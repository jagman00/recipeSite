const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

require('dotenv').config();
const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdmin = require('../middleware/authenticateAdmin');

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

// GET /api/recipes/:id/comments
// Get all comments for a specific recipe
router.get("/:id/comments", authenticateUser, async (req, res, next) => {
    const { id } = req.params;

    try {
        // Fetch comments linked to the given recipe ID
        const comments = await prisma.comment.findMany({
            where: { recipeId: parseInt(id) },
            include: { 
                user: { 
                    select: {
                        userId: true,
                        name: true,
                        profileUrl: true,
                        userTitle: true,
                    }
                }
            }
        });

        if (!comments || comments.length === 0) {
            return res.status(404).json({ message: "No comments found for this recipe." });
        }

        res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch comments." });
    }
});

// POST /api/recipes/:id/comments
// Add a comment to a specific recipe
router.post("/:id/comments", authenticateUser, async (req, res, next) => {
    const { id } = req.params; 
    const { text } = req.body; 

    // Validate comment text
    if (!text || typeof text !== 'string' || text.trim() === "") {
        return res.status(400).json({ error: "Text is required and must be a non-empty string." });
    }

    try {
        // Create a new comment for the given recipe ID
        const newComment = await prisma.comment.create({
            data: {
                text,
                recipeId: parseInt(id), // Link comment to recipe
                userId: req.user.userId, 
            },
            include: { 
                user: { 
                    select: {
                        userId: true,
                        name: true,
                        profileUrl: true,
                        userTitle: true,
                    }
                }
            }
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create comment." });
    }
});

// PUT /api/recipes/:recipeId/comments/:id
// Update a specific comment for a recipe
router.put("/:recipeId/comments/:id", authenticateUser, async (req, res, next) => {
    const { id } = req.params; 
    const { text } = req.body; 

    // Validate updated text
    if (!text || typeof text !== 'string' || text.trim() === "") {
        return res.status(400).json({ error: "Text is required and must be a non-empty string." });
    }

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(id) },
        });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Check authorization
        if (comment.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized to update this comment." });
        }

        // Update comment text
        const updatedComment = await prisma.comment.update({
            where: { id: parseInt(id) },
            data: { text },
        });

        res.status(200).json(updatedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update comment." });
    }
});

// DELETE /api/recipes/:recipeId/comments/:id
// Delete a specific comment for a recipe
router.delete("/:recipeId/comments/:id", authenticateAdmin, async (req, res, next) => {
    const { id } = req.params; // Comment ID

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(id) },
        });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Delete the comment
        await prisma.comment.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete comment." });
    }
});

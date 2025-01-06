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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const recipes = await prisma.recipe.findMany({
            skip,
            take: limit,
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
            orderBy: {
                createdAt: "desc", // Order by the newest recipe first
              },
        });

        // Count the total number of recipes
        const recipeCount = await prisma.recipe.count();

        res.status(200).json({recipes, recipeCount});
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
            },
        });

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

// Delete recipe (by the user or admin)
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

        res.status(204).end();
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
// Get all comments for a specific recipe (should be able to see by all users)
router.get("/:id/comments", async (req, res, next) => {
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
            },
            orderBy: {
                updatedAt: "desc", // Order by newest updated comment first
            },
        });

        if (!comments || comments.length === 0) {
            return res.status(404).json({ message: "There is no comment for this recipe." });
        }

        res.status(200).json(comments);
    } catch (error) {
        console.error("Error getting comment list:", error);
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
        console.error("Error creating a comment:", error);
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

        // Check authorization (can edit ony by owner)
        if (comment.userId !== req.user.userId) {
            return res.status(403).json({ message: "Unauthorized to update this comment." });
        }

        // Update comment text
        const updatedComment = await prisma.comment.update({
            where: { id: parseInt(id) },
            data: { text },
        }); //frontend need comment writer info or not??

        res.status(200).json(updatedComment);
    } catch (error) {
        console.error("Error updating a comment:", error);
        res.status(500).json({ message: "Failed to update comment." });
    }
});

// DELETE /api/recipes/:recipeId/comments/:id
// Delete a specific comment for a recipe (by author or admin)
router.delete("/:recipeId/comments/:id", authenticateUser, async (req, res, next) => {
    const { id } = req.params; // Comment ID

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: parseInt(id) },
        });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Check authorization (can delete by owner and admin)
        if (comment.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized to delete this comment." });
        }

        // Delete the comment
        await prisma.comment.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).end();
    } catch (error) {
        console.error("Error deleting a comment:", error);
        res.status(500).json({ message: "Failed to delete comment." });
    }
});

// Like a recipe
// POST /api/recipes/:id/like
router.post("/:id/like", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.like.create({
            data: {
                userId: req.user.userId,
                recipeId: parseInt(id),
            },
        });
        res.status(201).json({ message: "Recipe liked successfully" });
    } catch (error) {
        next(error);
    }
});

// Unlike a recipe
// DELETE /api/recipes/:id/like
router.delete("/:id/like", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.like.deleteMany({
            where: {
                userId: req.user.userId,
                recipeId: parseInt(id),
            },
        });
        res.status(200).json({ message: "Recipe unliked successfully" });
    } catch (error) {
        next(error);
    }
});

// Get all bookmarks of a specific user
// GET /api/users/:userId/bookmarks
router.get("/users/:userId/bookmarks", authenticateUser, async (req, res, next) => {
    const { userId } = req.params;
    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Unauthorized access" });
    }
    try {
        const bookmarks = await prisma.bookmark.findMany({
            where: { userId: parseInt(userId) },
            include: { recipe: true },
        });
        res.status(200).json(bookmarks);
    } catch (error) {
        next(error);
    }
});

// Save a recipe (Bookmark)
// POST /api/recipes/:id/bookmarks
router.post("/:id/bookmarks", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.bookmark.create({
            data: {
                userId: req.user.userId,
                recipeId: parseInt(id),
            },
        });
        res.status(201).json({ message: "Recipe bookmarked successfully" });
    } catch (error) {
        next(error);
    }
});

// Remove a bookmark
// DELETE /api/recipes/:id/bookmarks
router.delete("/:id/bookmarks", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.bookmark.deleteMany({
            where: {
                userId: req.user.userId,
                recipeId: parseInt(id),
            },
        });
        res.status(200).json({ message: "Bookmark removed successfully" });
    } catch (error) {
        next(error);
    }
});

// Delete a bookmark of a specific user
// DELETE /api/users/:userId/bookmarks/:recipeId
router.delete("/users/:userId/bookmarks/:recipeId", authenticateUser, async (req, res, next) => {
    const { userId, recipeId } = req.params;
    if (req.user.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Unauthorized access" });
    }
    try {
        await prisma.bookmark.deleteMany({
            where: {
                userId: parseInt(userId),
                recipeId: parseInt(recipeId),
            },
        });
        res.status(200).json({ message: "User's bookmark deleted successfully" });
    } catch (error) {
        next(error);
    }
});
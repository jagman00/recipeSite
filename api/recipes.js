const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

require('dotenv').config();
const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// Create a new recipe
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
            },
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
        const recipes = await prisma.recipe.findMany();
        res.status(200).json(recipes);
    } catch (error) {
        next(error);
    }
});

// Get a single recipe by ID
// GET /api/recipes/:id
router.get("/:id", async (req, res, next) => {
    const { id } = req.params;
    try {
        const recipe = await prisma.recipe.findUnique({
            where: { recipeId: parseInt(id) },
        });

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.status(200).json(recipe);
    } catch (error) {
        next(error);
    }
});

// Update a recipe
// PUT /api/recipes/:id
router.put("/:id", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    const { title, description, servingSize, recipeUrl, steps } = req.body;

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
            data: { title, description, servingSize, recipeUrl, steps },
        });

        res.status(200).json(updatedRecipe);
    } catch (error) {
        next(error);
    }
});

// Delete a recipe
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
        next(error);
    }
});

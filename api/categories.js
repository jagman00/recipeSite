const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

require('dotenv').config();
const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// Get all categories
router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { categoryName: 'asc' }
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
});

//Get a single category by ID
router.get('/:id', authenticateUser, authenticateAdmin, async (req, res, next) => {
    const { id } = req.params;
    try {
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                recipes: true, // Include associated recipes
            }
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Failed to fetch category' });
    }
});

// GET /api/categories/:id/recipes
router.get('/:id/recipes', async (req, res) => {
    const { id } = req.params;
    try {
        const recipes = await prisma.recipe.findMany({
            where: { categories: { some: { id: parseInt(id) } } },
            include: { user: true, ingredients: true }
        });
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch recipes for category' });
    }
});


//Create a new category (Admin Only)
router.post('/', authenticateAdmin, async (req, res, next) => {
    const { categoryName } = req.body;
    try {
        const newCategory = await prisma.category.create({
            data: { categoryName }
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Failed to create category' });
    }
});

//Update a category (Admin Only)
router.put('/:id', authenticateAdmin, async (req, res, next) => {
    const { id } = req.params;
    const { categoryName } = req.body;
    try {
        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { categoryName }
        });
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Failed to update category' });
    }
});

//Delete a category (Admin Only)
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Failed to delete category' });
    }
});

module.exports = router;
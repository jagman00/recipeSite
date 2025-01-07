const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

require('dotenv').config();
const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// Get all categories
// GET /api/categories
router.get('/', authenticateUser, async (req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { categoryName: 'asc' }
        });

        const categoryCount = await prisma.category.count();

        res.status(200).json({ categoryCount,categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
});

//  a single category by ID 
// GET /api/categories/:id
router.get('/:id', authenticateUser, async (req, res, next) => {
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

// Get all recipes associated with a single category
// GET /api/categories/:id/recipes
router.get('/:id/recipes', async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit; // Calculate the offset

    try {
        const recipes = await prisma.recipe.findMany({
            skip, // Skip this number of recipes
            take: limit, // Limit the number of recipes per page
            where: {  // Filter by category ID
                categories: { 
                    some: { id: parseInt(id) } 
                } },
            include: { user: true, ingredients: true },
            orderBy: { createdAt: "desc"},
        });

        // Count total recipes in this category
        const recipeCount = await prisma.recipe.count({
        where: { categories: { some: { id: parseInt(id) } } },
        });

        res.status(200).json({recipeCount, recipes});
    } catch (error) {
        console.error('Error fetching recipes for category:', error);
        res.status(500).json({ message: 'Failed to fetch recipes for category' });
    }
});


//Create a new category (Admin Only)
// POST /api/categories
router.post('/', authenticateAdmin, async (req, res, next) => {
    const { categoryName } = req.body;
    try {
        if (!categoryName || categoryName.trim() === '') {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const newCategory = await prisma.category.create({
            data: { categoryName }
        });
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Failed to create category' });
    }
});

// Update a category (Admin Only)
// PUT /api/categories/:id
router.put('/:id', authenticateAdmin, async (req, res, next) => {
    const { id } = req.params;
    const { categoryName } = req.body;
    try {
        if (!categoryName || categoryName.trim() === '') {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { categoryName }
        });
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating a category:', error);
        res.status(500).json({ message: 'Failed to update category' });
    }
});

// Delete a category (Admin Only)
// DELETE /api/categories/:id
router.delete('/:id', authenticateAdmin, async (req, res, next) => {
    const { id } = req.params;
    try {
        await prisma.category.delete({
            where: { id: parseInt(id) }
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting a category:', error);
        res.status(500).json({ message: 'Failed to delete category' });
    }
});

module.exports = router;
const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

require('dotenv').config();
const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdmin = require('../middleware/authenticateAdmin');
const { parse } = require("dotenv");

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
    const skip = (page - 1) * limit; // Calculate the offset

    try {
        const recipes = await prisma.recipe.findMany({
            skip, // Skip this number of recipes
            take: limit, // Limit the number of recipes per page
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

        res.status(200).json({recipeCount, recipes});
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
                comments: {
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
                        createdAt: "desc", // Order by the newest comment first
                      },
                },
                _count: { /* Include count of comments, bookmarks, and likes */
                    select: { 
                        bookmarks: true,
                        likes: true,
                        comments: true,
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

        const commentCount = await prisma.comment.count({
            where: { recipeId: parseInt(id) },
        });

        res.status(200).json({commentCount,comments});
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

// Like/Unlike a recipe by authenticated user (toggle) 
// POST /api/recipes/:id/like
router.post("/:id/like", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const existingLike = await prisma.like.findFirst({
            where: {
                userId: parseInt(userId),
                recipeId: parseInt(id),
            },
        });

        let likeStatus = false;

        if (existingLike) { // Unlike if already liked
            await prisma.like.delete({
                where: {
                    userId_recipeId: {
                        userId: parseInt(userId),
                        recipeId: parseInt(id),
                    },
                },
            });
        } else { // Like if not liked yet
            await prisma.like.create({
                data: {
                    userId: req.user.userId,
                    recipeId: parseInt(id),
                },
            });
            likeStatus = true;
        }

        const likeCount = await prisma.like.count({
            where: { recipeId: parseInt(id) },
        });

        res.status(200).json({ likeStatus, message: 'Like status updated',likeCount });
    } catch (error) {
        console.error('Error toggling like status:', error);
        res.status(500).json({ message: 'Failed to toggle like status.' });
    }
});

// // Unlike a recipe 
// // DELETE /api/recipes/:id/like
// router.delete("/:id/like", authenticateUser, async (req, res, next) => {
//     const { id } = req.params;
//     try {
//         await prisma.like.deleteMany({
//             where: {
//                 userId: req.user.userId,
//                 recipeId: parseInt(id),
//             },
//         });
//         res.status(200).json({ message: "Recipe unliked successfully" });
//     } catch (error) {
//         next(error);
//     }
// }); // combined with like/unlike

// // Get all bookmarks of a specific user
// // GET /api/users/:userId/bookmarks
// router.get("/users/:userId/bookmarks", authenticateUser, async (req, res, next) => {
//     const { userId } = req.params;
//     if (req.user.userId !== parseInt(userId)) {
//         return res.status(403).json({ message: "Unauthorized access" });
//     }
//     try {
//         const bookmarks = await prisma.bookmark.findMany({
//             where: { userId: parseInt(userId) },
//             include: { recipe: true },
//         });
//         res.status(200).json(bookmarks);
//     } catch (error) {
//         next(error);
//     }
// }); // already included in user.js

// Bookmark/UnBookmark a recipe by authenticated user (toggle)
// POST /api/recipes/:id/bookmarks
router.post("/:id/bookmarks", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
        const existingBookmark = await prisma.bookmark.findFirst({
            where: {
                userId: parseInt(userId),
                recipeId: parseInt(id),
            },
        });

        let bookmarkStatus = false;

        if (existingBookmark) { // Unsave if already saved
            await prisma.bookmark.delete({
                where: {
                    userId_recipeId: {
                        userId: parseInt(userId),
                        recipeId: parseInt(id),
                    },
                },
            });
        } else { // Save if not saved yet
            await prisma.bookmark.create({
                data: {
                    userId: parseInt(userId),
                    recipeId: parseInt(id),
                },
            });
            bookmarkStatus = true;
        }

        const bookmarkCount = await prisma.bookmark.count({
            where: { recipeId: parseInt(id) },
        });

        res.status(200).json({ bookmarkStatus, message: 'Bookmark status updated', bookmarkCount });
    } catch (error) {
        console.error('Error toggling bookmark status:', error);
        res.status(500).json({ message: 'Failed to toggle bookmark status.' });
    }
});

// // Remove a bookmark
// // DELETE /api/recipes/:id/bookmarks
// router.delete("/:id/bookmarks", authenticateUser, async (req, res, next) => {
//     const { id } = req.params;
//     try {
//         await prisma.bookmark.deleteMany({
//             where: {
//                 userId: req.user.userId,
//                 recipeId: parseInt(id),
//             },
//         });
//         res.status(200).json({ message: "Bookmark removed successfully" });
//     } catch (error) {
//         next(error);
//     }
// }); // combined with save/unsave

// // Delete a bookmark of a specific user
// // DELETE /api/users/:userId/bookmarks/:recipeId
// router.delete("/users/:userId/bookmarks/:recipeId", authenticateUser, async (req, res, next) => {
//     const { userId, recipeId } = req.params;
//     if (req.user.userId !== parseInt(userId)) {
//         return res.status(403).json({ message: "Unauthorized access" });
//     }
//     try {
//         await prisma.bookmark.deleteMany({
//             where: {
//                 userId: parseInt(userId),
//                 recipeId: parseInt(recipeId),
//             },
//         });
//         res.status(200).json({ message: "User's bookmark deleted successfully" });
//     } catch (error) {
//         next(error);
//     }
// }); // not necessary anymore if the user untoggle the bookmark

// Recipe Steps by ID
// GET /api/recipes/:id/steps
router.get("/:id/steps", async (req, res, next) => {
    const { id } = req.params;

    try {
        const recipe = await prisma.recipe.findUnique({
            where: { recipeId: parseInt(id) },
            select: { steps: true }
        });

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
        res.status(200).json({
            recipeId: id,
            steps: recipe.steps
        });
    } catch (error) {
        console.error("Error fetching recipe steps:", error);
        res.status(500).json({ message: "Failed to fetch recipe steps." });
    }
});

// Update Recipe Steps
// POST /api/recipes/:id/steps
router.post("/:id/steps", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    const { steps } = req.body;

    if (!Array.isArray(steps) || !steps.every(step => step.stepNumber && step.instruction)) {
        return res.status(400).json({ message: "Steps must be an array of objects with 'stepNumber' and 'instruction' fields." });
    }

    try {
        const recipe = await prisma.recipe.findUnique({
            where: { recipeId: parseInt(id) }
        });

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found." });
        }

        if (recipe.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized to update this recipe." });
        }

        const updatedRecipe = await prisma.recipe.update({
            where: { recipeId: parseInt(id) },
            data: { steps }
        });

        res.status(200).json({
            message: "Recipe steps updated successfully.",
            steps: updatedRecipe.steps
        });
    } catch (error) {
        console.error("Error updating recipe steps:", error);
        res.status(500).json({ message: "Failed to update recipe steps." });
    }
});

// REPORT
// Report a recipe by authenticated user
// POST /api/recipes/:id/report
router.post("/:id/report", authenticateUser, async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.userId;
    const { reason } = req.body;

    try {
        const existingReport = await prisma.recipeReport.findFirst({
            where: {
                reporterId: parseInt(userId),
                recipeId: parseInt(id),
            },
          });

        if (existingReport) {
            return res.status(400).json({ message: "You have already reported this recipe." });
        }

        const report = await prisma.recipeReport.create({
            data: {
                reporterId: parseInt(userId),
                recipeId: parseInt(id),
                reason,
            },
            include: { recipe: true },
        });

        const reportCountForThisRecipe = await prisma.recipeReport.count({
            where: { recipeId: parseInt(id) },
        });

        const reportStatus = true;

        res.status(201).json({ reportStatus,report, reportCountForThisRecipe});
    } catch (error) {
        console.error("Error reporting recipe:", error);
        res.status(500).json({ message: "Failed to report recipe." });
    }
});
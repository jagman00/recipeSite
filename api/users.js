const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdmin = require('../middleware/authenticateAdmin');


// GET /api/users
// Get all users (admin only)
router.get("/", authenticateAdmin, async(req,res,next)=>{
    try {
        const users = await prisma.user.findMany({
            include:{recipes:true},
        });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Fail to fetch users"});
    }
});

// GET /api/users/:id
// Get a user by id
router.get("/:id", async(req,res,next)=>{
    const {id} = req.params;
    try {
        const user = await prisma.user.findUnique({
            where:{userId: parseInt(id)},
            include:{recipes:true},
        });

        if(!user) return res.status(404).json({message: "User not found"});

        res.json(user);
    } catch (err) {
        next(err);
    }
});

// GET /api/users/:id/recipes
// Get all recipes created by a specific user
router.get("/:id/recipes", async(req,res,next)=>{
    const {id} = req.params;
    try {
        const recipes = await prisma.recipe.findMany({
            where:{userId: parseInt(id)},
            include:{user:true},
        });

        if(!recipes) return res.status(404).json({message: "Recipes not found"});

        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Fail to fetch recipes"});
    }
}); 

// PUT /api/users/:id *
// Update a user profile by id (only the user)
router.put("/:id", authenticateUser, async(req,res,next)=>{
    const {id} = req.params;
    const {name, email, profileUrl, userTitle, bio} = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where:{userId: parseInt(id)},
            data:{name, email, profileUrl, userTitle, bio},
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Fail to update user"});
    }
});

// DELETE /api/users/:id
// Delete a user by id (by the user or an admin) //need to cased delete on schema
router.delete("/:id", authenticateUser||authenticateAdmin , async(req,res,next)=>{
    const {id} = req.params;
    try {
        const user = await prisma.user.findUnique({
            where:{userId: parseInt(id)},
        });
        if(!user) return res.status(404).json({message: "User not found"});

        await prisma.user.delete({
            where:{userId: parseInt(id)},
        });

        res.status(204).json({message: "User deleted"});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Fail to delete user"});
    }
});

// Delete a recipe (restricted to the recipe’s creator).
// DELETE /api/users/:id/recipes/:recipeId
router.delete("/:id/recipes/:recipeId", authenticateUser, async(req,res,next)=>{
    const {id, recipeId} = req.params;
    try {
        const recipe = await prisma.recipe.findUnique({
            where:{recipeId: parseInt(recipeId)},
        });

        if(!recipe) return res.status(404).json({message: "Recipe not found"});

        await prisma.recipe.delete({
            where:{recipeId: parseInt(recipeId)},
        });

        res.status(204).json({message: "Recipe deleted"});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Fail to delete recipe"});
    }
});

// Get all bookmarks of a specific user
// GET /api/users/:id/bookmarks
router.get("/:id/bookmarks", async(req,res,next)=>{
    const {id} = req.params;
    try {
        const bookmarks = await prisma.bookmark.findMany({
            where:{userId: parseInt(id)},
            include:{
                recipe:{
                    include:{
                        user: {select:{userId:true, name:true}},
                },
            },
        }
    });

        if(!bookmarks) return res.status(404).json({message: "Bookmarks not found"});

        res.status(200).json(bookmarks);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Fail to fetch bookmarks"});
    }
});
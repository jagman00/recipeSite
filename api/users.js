const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdmin = require('../middleware/authenticateAdmin');

// GET /api/users
// Get all users (by admin only)
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
            select:{
                userId:true, 
                name:true, 
                email:true, 
                profileUrl:true, 
                userTitle:true, 
                bio:true, 
                createdAt:true,
            },           
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
            include:{
                user: {select:{
                    userId:true, 
                    name:true,
                    email:true,
                    profileUrl:true,
                    userTitle:true,
                    createdAt:true,
                    updatedAt:true,
                }
                },
        }});

        if(!recipes) return res.status(404).json({message: "Recipes not found"});

        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Fail to fetch recipes"});
    }
}); 

// PATCH /api/users/:id *
// Update a user profile by id (only the user)
router.patch("/:id", authenticateUser, async(req,res,next)=>{
    const {id} = req.params;
    const {name, email, profileUrl, userTitle, bio} = req.body;
    try {
        if(req.user.userId !== parseInt(id)){
            return res.status(403).json({message: "You are not authorized to update this user's profile"});
        }
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
// Delete a user by id (by the user or an admin) 
router.delete("/:id", authenticateUser||authenticateAdmin, async(req,res,next)=>{
    const {id} = req.params;
    try {
        const user = await prisma.user.findUnique({
            where:{userId: parseInt(id)},
        });
        if(!user) return res.status(404).json({message: "User not found"});

        // Check if the user is the owner of the account or an admin
        if (parseInt(id) !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "You are not authorized to delete this account" });
        }
        
        await prisma.user.delete({
            where:{userId: parseInt(id)},
        });

        res.status(204).json({message: "User deleted"});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Fail to delete user"});
    }
});

// Delete a recipe (by the user) 
// DELETE /api/users/:id/recipes/:recipeId
// router.delete("/:id/recipes/:recipeId", authenticateUser, async(req,res,next)=>{
//     const {id, recipeId} = req.params;
//     try {
//         const recipe = await prisma.recipe.findUnique({
//             where:{recipeId: parseInt(recipeId)},
//         });

//         if(!recipe) return res.status(404).json({message: "Recipe not found"});

//         if (req.user.userId !== parseInt(id)) {
//             return res.status(403).json({ message: "You are not authorized to delete this recipe" });
//         }

//         await prisma.recipe.delete({
//             where:{recipeId: parseInt(recipeId)},
//         });

//         res.status(204).json({message: "Recipe deleted"});
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({message: "Fail to delete recipe"});
//     }
// });

// Get all bookmarks of a specific user (only by the user) (admin cannot access)
// GET /api/users/:id/bookmarks
router.get("/:id/bookmarks", authenticateUser, async(req,res,next)=>{
    const {id} = req.params;
    try {
        if(req.user.userId !== parseInt(id)){
            return res.status(403).json({message: "You are not authorized to view this user's bookmarks"});
        }

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



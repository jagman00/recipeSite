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
        }});

        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.status(200).json(recipe);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch a recipe" });
    }
});
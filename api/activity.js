const router = require("express").Router();
const prisma = require("../prisma");
const authenticateUser = require("../middleware/authenticateUser");

// GET /api/activity-feed
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log("Fetching activity feed for user:", userId);

    // Step 1: Fetch users followed by the authenticated user
    const followedUsers = await prisma.userFollower.findMany({
      where: { followFromUserId: userId },
      select: { followToUserId: true },
    });

    const followedUserIds = followedUsers.map((follow) => follow.followToUserId);

    console.log("Followed User IDs:", followedUserIds);

    if (!followedUserIds || followedUserIds.length === 0) {
      console.log("No users followed by this user. Returning an empty array.");
      return res.status(200).json([]); // No followed users
    }

    // Step 2: Fetch activity feed for followed users
    const activities = await prisma.activity.findMany({
      where: { userId: { in: followedUserIds } },
      include: {
        user: { select: { userId: true, name: true, profileUrl: true } },
        recipe: { select: { recipeId: true, title: true, recipeUrl: true } },
        comment: { select: { id: true, text: true, recipeId: true, createdAt: true } },
        like: { select: { id: true, userId: true, recipeId: true } },
        bookmark: { select: { bookmarkId: true, userId: true, recipeId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    console.log("Fetched Activities:", activities);

    // Step 3: Return the activities
    return res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching activity feed:", error.message);
    return res.status(500).json({ message: "Failed to fetch activity feed.", error: error.message });
  }
});

prisma.$on("query", (e) => {
  console.log("Query:", e.query);
  console.log("Params:", e.params);
});

// for possible recommendations
// GET /api/activity-feed/unliked-recipes

router.get("/unliked-recipes", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch activity user IDs linked to this user
    const userActivities = await prisma.activity.findMany({
      where: { userId },
      select: { userId: true },
    });

    const activityUserIds = userActivities.map((activity) => activity.userId);

    // Fetch unliked recipes and new recipes
    const unlikedAndNewRecipes = await prisma.recipe.findMany({
      where: {
        OR: [
          {
            // Recipes not liked by the user
            NOT: {
              likes: { some: { userId } },
            },
          },
          {
            // New recipes added in the last 7 days
            createdAt: {
              gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            },
          },
        ],
      },
      include: {
        user: {
          select: { name: true, profileUrl: true },
        },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20, // Limit the number of results
    });

    return res.status(200).json(unlikedAndNewRecipes);
  } catch (error) {
    console.error("Error fetching unliked or new recipes:", error.message);
    return res.status(500).json({
      message: "Failed to fetch unliked or new recipes.",
      error: error.message,
    });
  }
});

router.get("/user-item-matrix", async (req, res) => {
  try {
    const userItemMatrix = await prisma.activity.groupBy({
      by: ["userId", "recipeId"],
      _sum: {
        weight: true, 
      },
      orderBy: {
        userId: "asc",
      },
    });

    const formattedMatrix = userItemMatrix.map((entry) => ({
      userId: entry.userId,
      recipeId: entry.recipeId,
      interactionWeight: entry._sum.weight,
    }));

    res.status(200).json(formattedMatrix);
  } catch (error) {
    console.error("Error generating User-Item Matrix:", error.message);
    res.status(500).json({ message: "Failed to fetch User-Item Matrix", error: error.message });
  }
});

 
module.exports = router;
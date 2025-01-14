const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

const authenticateUser = require("../middleware/authenticateUser");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// GET /api/users
// Get all users (by admin only)
router.get("/", authenticateAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { recipes: true },
      orderBy: {
        createdAt: "desc", // Order by the newest member first
      },
    });

    // Count the total number of users
    const userCount = await prisma.user.count();

    res.status(200).json({ userCount,users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fail to fetch users" });
  }
});

// GET /api/users/:id /*UPDATED */
// Get a speicifc user by id including his recipes /*Updated */ only registered users
router.get("/:id", authenticateUser , async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { userId: parseInt(id) },
      // select: {
      //   userId: true,
      //   name: true,
      //   email: true,
      //   profileUrl: true,
      //   userTitle: true,
      //   bio: true,
      //   createdAt: true,
      // },
      include: {
        recipes: {
          select: {
            recipeId: true,
            title: true,
            description: true,
            servingSize: true,
            recipeUrl: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { likes: true, bookmarks: true, comments: true },
            },
          },
          orderBy: { updatedAt: "desc" }, // Order by newest updated recipe first
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id/recipes
// Get all recipes created by a specific user
router.get("/:id/recipes", async (req, res, next) => {
  const { id } = req.params;
  try {
    const recipes = await prisma.recipe.findMany({
      where: { userId: parseInt(id) },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
            profileUrl: true,
            userTitle: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc", // Order by newest updated comment first
      },
    });

    if (!recipes) return res.status(404).json({ message: "Recipes not found" });

    const recipeCount = await prisma.recipe.count({
      where: { userId: parseInt(id) },
    });

    res.status(200).json({recipeCount,recipes});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fail to fetch recipes" });
  }
});

// PUT /api/users/:id *
// Update a user profile by id (only the user)
router.put("/:id", authenticateUser, async (req, res, next) => {
  const { id } = req.params;
  const { name, email, profileUrl, userTitle, bio } = req.body;
  try {
    if (req.user.userId !== parseInt(id)) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to update this user's profile",
        });
    }
    const updatedUser = await prisma.user.update({
      where: { userId: parseInt(id) },
      data: { name, email, profileUrl, userTitle, bio },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fail to update user" });
  }
});

// DELETE /api/users/:id
// Delete a user by id (by the user or an admin)
router.delete(
  "/:id",
  authenticateUser,
  async (req, res, next) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { userId: parseInt(id) },
      });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Check if the user is the owner of the account or an admin
      if (parseInt(id) !== req.user.userId && !req.user.isAdmin) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this account" });
      }

      await prisma.user.delete({
        where: { userId: parseInt(id) },
      });

      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Fail to delete user" });
    }
  }
);

// Get all bookmarked recipes of a specific user (only by the user) (admin cannot access)
// GET /api/users/:id/bookmarks
router.get("/:id/bookmarks", authenticateUser, async (req, res, next) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10; 
  const skip = (page - 1) * limit; // Calculate the offset
  
  try {
    if (req.user.userId !== parseInt(id)) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to view this user's bookmarks",
        });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: parseInt(id) },
      include: {
        recipe: {
          include: {
            user: { 
                select: { userId: true, name: true, profileUrl:true } 
            },
            _count: { 
                select: { likes: true, bookmarks:true ,comments: true }
            },
          },
        },
      },
      orderBy: { bookmarkId: "desc"}, // newest bookmark first
      skip, // Skip this number of recipes
      take: limit, // Limit the number of recipes per page
    });

    if (!bookmarks)
      return res.status(404).json({ message: "Bookmarks not found" });

    // Extract only recipes from the bookmarks
    const recipes = bookmarks.map((bookmark) => bookmark.recipe);

    const bookmarkCount = await prisma.bookmark.count({
        where: { userId: parseInt(id) },
        });

    res.status(200).json({bookmarkCount,recipes});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fail to fetch bookmarks" });
  }
});

// GET /api/users/:id/comments
// Get all comments created by a specific user
router.get("/:id/comments", authenticateUser, async (req, res, next) => {
  const { id } = req.params; // User ID from request parameters

  try {
    // Check if the authenticated user matches the requested user ID or is an admin
    if (req.user.userId !== parseInt(id) && !req.user.isAdmin) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to view this user's comments.",
        });
    }

    // Fetch all comments for the given user ID
    const comments = await prisma.comment.findMany({
      where: { userId: parseInt(id) },
      include: {
        recipe: {
          // Include associated recipe details
          select: {
            recipeId: true,
            title: true,
          },
        },
        user: {
          // Include user details
          select: {
            userId: true,
            name: true,
            profileUrl: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc", // Order by newest updated comment first
      },
    });

    // If no comments are found
    if (!comments || comments.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this user." });
    }

    const commentCount = await prisma.comment.count({
        where: { userId: parseInt(id) },
        });

    res.status(200).json({commentCount,comments});
  } catch (error) {
    console.error("Error in getting a comment:", error);
    res.status(500).json({ message: "Failed to fetch comments." });
  }
});

// FOLLOWING ROUTES
// Toggle Follow/Unfollow (only by authenticated user)
// allows a user to follow/unfollow another user
// POST /api/users/:id/follow
router.post("/:id/follow", authenticateUser, async (req, res, next) => {
    const { id } = req.params; // id of the user to follow/unfollow
    const  currentUserId = parseInt(req.user.userId); // id of the authenticated user
    try {
      if (currentUserId === parseInt(id)) {
        return res
          .status(400)
          .json({ message: "You cannot follow yourself" });
      }
  
      // Check if the user is already following the target user
      const existingFollow = await prisma.userFollower.findUnique({
        where: {
            followFromUserId_followToUserId: {
              followFromUserId: currentUserId,
              followToUserId: parseInt(id),
            },
          },
      });

      let followStatus = false;
  
      if (existingFollow) { // Unfollow if already following
        await prisma.userFollower.delete({
          where: {
              followFromUserId_followToUserId: {
                followFromUserId: currentUserId,
                followToUserId: parseInt(id),
              },
            },
        });
      } else { // Follow if not following yet
        await prisma.userFollower.create({
          data: {
            followFromUserId: currentUserId,
            followToUserId: parseInt(id),
          },
        });
        followStatus = true;
      }
  
      res.status(200).json({ followStatus ,message: "Follow status updated" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update follow status" });
    }
});


// Get follow status /*UPDATE*/
// GET /api/users/:id/follow-status 
router.get("/:id/follow-status", authenticateUser, async (req, res, next) => {
  const { id } = req.params; // id of the user to follow/unfollow
  const userId = req.user.userId;

  try {
      const existingFollow = await prisma.userFollower.findUnique({
        where: {
          followFromUserId_followToUserId: {
            followFromUserId: parseInt(userId),
            followToUserId: parseInt(id),
          },
        },
      });
  
      res.status(200).json({ followStatus: !!existingFollow }); // Return boolean value
    } catch (error) {
      console.error("Error fetching follow status:", error);
      res.status(500).json({ message: "Failed to fetch follow status." });
    }
  });

// Get the list of followers for a specific user 
// GET /api/users/:id/followers
router.get("/:id/followers", async (req, res, next) => {
  const { id } = req.params; 
  try {
    const followers = await prisma.userFollower.findMany({
      where: { followToUserId: parseInt(id) }, // People following this user
      include: {
        followFromUser: { // Include the details of the follower
          select: {
            userId: true,
            name: true,
            profileUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" }, // Order by newest follower first
    });

    const followerList = followers.map((follower) => follower.followFromUser);
    const followerCount = followerList.length;

    res.status(200).json({followerCount,followerList});
    // A consistent structure, even if the followers list is empty 
    // ({ followerCount: 0, followerList: [] })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch followers" });
  }
});

// Get the list of people that the user is following
// GET /api/users/:id/followings
router.get("/:id/followings", async (req, res, next) => {
  const { id } = req.params; 
  try {
    const followings = await prisma.userFollower.findMany({
      where: { followFromUserId: parseInt(id) }, // People this user is following
      include: {
        followToUser: { // Include the details of people being followed
          select: {
            userId: true,
            name: true,
            profileUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const followingList = followings.map((following) => following.followToUser);
    const followingCount = followingList.length;

    res.status(200).json({followingCount,followingList});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch followings" });
  }
});

const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma"); // Prisma client for database interaction

const authenticateUser = require("../middleware/authenticateUser"); // Middleware for user authentication
const authenticateAdmin = require("../middleware/authenticateAdmin"); // Middleware for admin authentication

// Get all comments with pagination 
router.get("/", authenticateUser, async (req, res) => {
  const { limit = 10, offset = 0 } = req.query; // Set default pagination values
  try {
    // Fetch comments with pagination and include related user and recipe details
    const comments = await prisma.comment.findMany({
      skip: parseInt(offset),
      take: parseInt(limit),
      include: {
        recipe: true, // Include associated recipe details
        user: {
          select: {
            id: true,
            name: true,
            userTitle: true, // Include user's job title
            bio: true, // Include user's bio
            profileUrl: true, // Include user's profile URL
          },
        },
      },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments." }); // Handle errors
  }
});

// Get a specific comment by ID
router.get("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params; // Extract comment ID from request parameters
  try {
    // Fetch a single comment by ID with related recipe and user details
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: {
        recipe: true,
        user: {
          select: {
            id: true,
            name: true,
            userTitle: true, 
            bio: true, 
            profileUrl: true, 
          },
        },
      },
    });
    if (comment) {
      res.json(comment);
    } else {
      res.status(404).json({ error: "Comment not found." }); // Handle case where comment does not exist
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the comment." });
  }
});

// Create a new comment
router.post("/", authenticateUser, async (req, res) => {
  const { text, recipeId } = req.body;

  // Manual validation
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res
      .status(400)
      .json({ error: "Text is required and must be a non-empty string." });
  }
  if (!recipeId || !Number.isInteger(recipeId)) {
    return res
      .status(400)
      .json({ error: "Recipe ID is required and must be an integer." });
  }

  try {
    // Create a new comment associated with the authenticated user
    const newComment = await prisma.comment.create({
      data: {
        text,
        recipeId,
        userId: req.user.id, // Use authenticated user's ID
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userTitle: true, 
            bio: true, 
            profileUrl: true, 
          },
        },
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment." }); // Handle database errors
  }
});

// Update a comment
router.put("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params; 
  const { text } = req.body; 

  // Manual validation
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res
      .status(400)
      .json({ error: "Text is required and must be a non-empty string." });
  }

  try {
    // Check if the comment exists and the user is authorized to update it
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!comment || (comment.userId !== req.user.id && !req.user.isAdmin)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to modify this comment." }); 
    }

    // Update the comment text
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { text },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            userTitle: true, 
            bio: true, 
            profileUrl: true, 
          },
        },
      },
    });
    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update comment." });
  }
});

// Delete a comment
router.delete("/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params; 
  try {
    // Check if the comment exists before attempting deletion
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found." }); // Handle if comment does not exist
    }

    // Delete the comment from the database
    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end(); // Respond with no content on successful deletion
  } catch (error) {
    res.status(500).json({ error: "Failed to delete comment." }); // Handle errors
  }
});

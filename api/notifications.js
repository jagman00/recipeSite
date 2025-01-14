const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const authenticateUser = require('../middleware/authenticateUser')

// Get all notifications for logged-in user
// GET /api/notifications
router.get('/', authenticateUser, async (req, res) => {
    const userId = req.user.userId;
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: parseInt(userId) },
            include: {
                fromUser: {
                    select: { userId: true, name: true }, // Include commenter/liker details
                },
                recipe: {
                    select: { recipeId: true, title: true }, // Include recipe details
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 20, // Limit to the most recent 20 notifications
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
});

module.exports = router;
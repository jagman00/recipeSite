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
        });
        res.status(200).json(notifications);

        // Emit an event to notify the client
        req.io.to(`user-${userId}`).emit('newNotification' , notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
});

// Mark notifications as read
// PUT /api/notifications/mark-read
router.put('/mark-read', authenticateUser, async (req, res) => {
    const userId = req.user.userId;
    try {
        await prisma.notification.updateMany({
            where: { userId: parseInt(userId), read: false },
            data: { read: true },
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error marking notifications as read:', error.message);
        res.status(500).json({ message: 'Failed to mark notifications as read.' });
    }
});

module.exports = router;
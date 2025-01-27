const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");
const cors = require('cors');

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
router.use(cors());
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const authenticateUser = require('../middleware/authenticateUser')
//const authenticateAdmin = require('../middleware/authenticateAdmin');

const createToken = (user) => {
    return jwt.sign(
      { userId: user.userId, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );
  };

// Register,create new user and create token
// POST /api/auth/register
router.post("/register", async(req,res,next)=>{
    const {name, email, password, isAdmin} = req.body;
    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({message: "Name, email and password are required."})
        }
        
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where:{email}
        })
        if (existingUser) {
            return res.status(400).json({message: "A user with this email already exist."})
        }
        
        // Create a new user with hashed password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data:{
                name,
                email,
                password: hashedPassword,
                isAdmin,
            },
        });

        const token = createToken(user);
        res.status(201).json({token, userId: user.userId});
    } catch (error) {
        next(error);
    }
});

// Login user and create token
// POST /api/auth/login
router.post("/login", async(req,res,next)=>{
    const {email, password} = req.body; //unique email
    try {
        const user = await prisma.user.findUnique({
            where:{email}, 
        });

        if(!user){ 
            return res.status(401).json({message: "Invalid credentials-A"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); 
        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid credentials-B"});
        }

        const token = createToken(user);
        res.status(201).json({token, userId: user.userId});
    } catch (error) {
        next(error);
    }
});

// Get the authenticated user
// GET /api/auth/me 
router.get("/me", authenticateUser, async (req,res)=>{
    try {
        const user = await prisma.user.findUnique({
            where:{userId: req.user.userId},
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
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});

router.post('/google-login', async (req, res, next) => {
    const { credential } = req.body;

    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        // Check if user already exists in your database
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Register the user if they don't exist
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    googleId,
                    provider: 'google',
                },
            });
        }

        // Generate a token for the user
        const token = createToken(user);

        res.json({ token, userId: user.userId });
    } catch (error) {
        console.error('Google Login Error:', error);
        next(error);
    }
});

const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = await prisma.user.create({
            data:{
                name,
                email,
                password: hashedPassword,
                isAdmin,
            }
        });

        const token = createToken(newUser);
        res.status(201).json(token);
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
            where:{email} 
        });

        if(!user){ 
            return res.status(401).json({message: "Invalid credentials-A"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password); 
        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid credentials-B"});
        }

        const token = createToken(user);
        res.status(201).json(token);
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
            include:{recipes:true},
        });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
});
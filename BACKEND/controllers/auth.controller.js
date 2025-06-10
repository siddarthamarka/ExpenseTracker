const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/auth.model');

// User Signup
exports.signup = async (req, res) => {
    try {

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create user with reference to organization
        const user = await User.create({
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name,
        });

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Return user data (without password) and token
        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,

            },
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({ message: error.message });
    }
};

// User Login
exports.login = async (req, res) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }


        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Return user data and token
        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name || '',
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Verify token
exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ error: 'Access denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Invalid token' });
    }
};
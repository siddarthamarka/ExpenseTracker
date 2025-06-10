const express = require('express');
const authController = require('../controllers/auth.controller');
const bcrypt = require('bcryptjs');
const User = require('../models/auth.model');
const router = express.Router();

// User signup with organization creation
router.post('/signup', authController.signup);

// User login
router.post('/login', authController.login);


module.exports = router;
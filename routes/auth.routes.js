const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout); // Token verification required for logout

module.exports = router;
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key'; // Should match the secret in auth.controller.js

// Middleware to verify token and check authentication
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

        if (!token) {
            return res.status(401).json({ message: 'Invalid authorization format' });
        }

        // Verify token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid or expired token' });
            }

            // Attach user data to request
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Token verification failed', error: error.message });
    }
};

module.exports = { verifyToken };

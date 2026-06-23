const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("authHeader : ", authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token is missing' });
    }
    try {
        console.log("token : ", token);
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'token verification failed' });
    }
}


module.exports = {
    authenticateToken
}
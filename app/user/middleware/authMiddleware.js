// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // assuming "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Token is invalid or expired' });
    }
    // If valid, attach user info to request and proceed
    req.user = user;
    next();
  });
};

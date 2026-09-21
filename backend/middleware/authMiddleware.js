const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. Authentication token required.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication token.'
    });
  }
};


const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. You do not have permission to perform this action.'
      });
    }

    next();
  };
};


module.exports = {
  authenticateToken,
  authorizeRoles
};
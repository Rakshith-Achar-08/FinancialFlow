const jwt = require('jsonwebtoken');
const { User, Institution } = require('../models');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Institution, attributes: ['id', 'name', 'type'] }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.audit('Unauthorized access attempt', {
        userId: req.user.id,
        requiredRoles: roles,
        userRole: req.user.role,
        path: req.path,
        method: req.method
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const authorizeInstitution = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admins can access any institution
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if user belongs to the institution they're trying to access
    const institutionId = req.params.institutionId || req.body.institution_id || req.query.institution_id;
    
    if (institutionId && req.user.institution_id !== institutionId) {
      logger.audit('Cross-institution access attempt', {
        userId: req.user.id,
        userInstitution: req.user.institution_id,
        requestedInstitution: institutionId,
        path: req.path
      });
      return res.status(403).json({ error: 'Access denied to this institution' });
    }

    next();
  } catch (error) {
    logger.error('Institution authorization error:', error);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        include: [{ model: Institution, attributes: ['id', 'name', 'type'] }]
      });

      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeInstitution,
  optionalAuth
};

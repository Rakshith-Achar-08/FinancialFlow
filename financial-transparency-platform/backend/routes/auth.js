const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { User, Institution, AuditLog } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required(),
  role: Joi.string().valid('admin', 'auditor', 'viewer').default('viewer'),
  institution_id: Joi.string().uuid().optional(),
  phone: Joi.string().optional(),
  department: Joi.string().optional(),
  position: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(6).required()
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: value.email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Verify institution exists if provided
    if (value.institution_id) {
      const institution = await Institution.findByPk(value.institution_id);
      if (!institution) {
        return res.status(400).json({ error: 'Invalid institution ID' });
      }
    }

    // Create user
    const user = await User.create(value);
    const token = generateToken(user.id);

    // Log registration
    logger.audit('User registered', {
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institution_id
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        institution_id: user.institution_id
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find user
    const user = await User.findOne({
      where: { email: value.email },
      include: [{ model: Institution, attributes: ['id', 'name', 'type'] }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(value.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate token
    const token = generateToken(user.id);

    // Log successful login
    logger.audit('User login', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        institution_id: user.institution_id,
        institution: user.Institution,
        last_login: user.last_login
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Institution, attributes: ['id', 'name', 'type'] }]
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        institution_id: user.institution_id,
        institution: user.Institution,
        phone: user.phone,
        department: user.department,
        position: user.position,
        last_login: user.last_login,
        created_at: user.created_at
      }
    });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const allowedFields = ['first_name', 'last_name', 'phone', 'department', 'position'];
    const updates = {};

    // Only allow updating specific fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await req.user.update(updates);

    logger.audit('Profile updated', {
      userId: req.user.id,
      updates: Object.keys(updates)
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verify current password
    const isValidPassword = await req.user.comparePassword(value.current_password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await req.user.update({ password: value.new_password });

    logger.audit('Password changed', {
      userId: req.user.id,
      email: req.user.email
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout (client-side token invalidation)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    logger.audit('User logout', {
      userId: req.user.id,
      email: req.user.email
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, institution_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (institution_id) where.institution_id = institution_id;

    // Non-super admins can only see users from their institution
    if (req.user.role !== 'super_admin' && req.user.institution_id) {
      where.institution_id = req.user.institution_id;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [{ model: Institution, attributes: ['id', 'name', 'type'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
router.put('/users/:userId/role', authenticateToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!['admin', 'auditor', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Non-super admins can only manage users from their institution
    if (req.user.role !== 'super_admin' && user.institution_id !== req.user.institution_id) {
      return res.status(403).json({ error: 'Cannot manage users from other institutions' });
    }

    await user.update({ role });

    logger.audit('User role updated', {
      adminId: req.user.id,
      targetUserId: userId,
      newRole: role,
      oldRole: user.role
    });

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    logger.error('Role update error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;

const express = require('express');

const {
  getMyProfile,
  updateMyProfile,
  changeMyPassword
} = require('../controllers/profileController');

const {
  authenticateToken
} = require('../middleware/authMiddleware');

const router = express.Router();


// Get logged-in user's profile
router.get(
  '/me',
  authenticateToken,
  getMyProfile
);


// Update logged-in user's profile
router.put(
  '/me',
  authenticateToken,
  updateMyProfile
);


// Change logged-in user's password
router.put(
  '/password',
  authenticateToken,
  changeMyPassword
);


module.exports = router;
const express = require('express');

const {
  getPendingTeamRequests,
  getTeamLeaveRequestById,
  approveLeaveRequest,
  rejectLeaveRequest
} = require('../controllers/managerController');

const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/pending',
  authenticateToken,
  authorizeRoles('Manager'),
  getPendingTeamRequests

);

router.get(
  '/requests/:id',
  authenticateToken,
  authorizeRoles('Manager'),
  getTeamLeaveRequestById
);

router.put(
  '/requests/:id/approve',
  authenticateToken,
  authorizeRoles('Manager'),
  approveLeaveRequest
);

router.put(
  '/requests/:id/reject',
  authenticateToken,
  authorizeRoles('Manager'),
  rejectLeaveRequest
);

module.exports = router;
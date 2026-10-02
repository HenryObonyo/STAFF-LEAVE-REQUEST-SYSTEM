const express = require('express');

const {
  submitLeaveRequest,
  getMyLeaveRequests,
  getMyLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
  getMyLeaveBalances
} = require('../controllers/leaveController');

const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = express.Router();


// Employee submits leave request
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Employee', 'Manager'),
  submitLeaveRequest
);


// Employee/Manager views own leave requests
router.get(
  '/my',
  authenticateToken,
  authorizeRoles('Employee', 'Manager'),
  getMyLeaveRequests
);


// Employee/Manager views own leave balances

router.get(
  '/balances',
  authenticateToken,
  authorizeRoles('Employee', 'Manager'),
  getMyLeaveBalances
);


// Employee/Manager views one of their own requests
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Employee', 'Manager'),
  getMyLeaveRequestById
);


// Employee/Manager edits pending request
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Employee', 'Manager'),
  updateLeaveRequest
);


// Employee deletes own leave request
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('Employee', 'Manager'),
  deleteLeaveRequest
);

module.exports = router;
const express = require('express');

const {
  getAllEmployees,
  getAllLeaveRequests,
  approveManagerLeaveRequest,
  rejectManagerLeaveRequest,
  getDashboardStats

} = require('../controllers/adminController');

const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/employees',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  getAllEmployees
);

router.get(
  '/leave-requests',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  getAllLeaveRequests
);


router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  getDashboardStats
);

router.put(
  '/manager-requests/:id/approve',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  approveManagerLeaveRequest
);

router.put(
  '/manager-requests/:id/reject',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  rejectManagerLeaveRequest
);



module.exports = router;
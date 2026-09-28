const express = require('express');

const {
  getAllEmployees,
  getAllDepartments,
  getAllLeaveRequests,
  approveManagerLeaveRequest,
  rejectManagerLeaveRequest,
  getDashboardStats,
  getAuditLogs,
  updateEmployeeStatus
} = require('../controllers/adminController');


const {
  createEmployee
} = require('../controllers/authController');


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

router.get(
  "/audit-logs",
  authenticateToken,
  authorizeRoles("HR/Admin"),
  getAuditLogs
);


router.post(
  '/employees',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  createEmployee
);

router.put(
  '/employees/:user_id/status',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  updateEmployeeStatus
);

router.get(
  '/departments',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  getAllDepartments
);



module.exports = router;
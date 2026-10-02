const express = require('express');

const {
  getAllEmployees,
  getAllDepartments,
  createDepartment,
  deleteDepartment,
  getAllLeaveRequests,
  approveManagerLeaveRequest,
  rejectManagerLeaveRequest,
  getDashboardStats,
  getAuditLogs,
  updateEmployeeStatus
} = require('../controllers/adminController');

const {
  getAllLeaveTypes,
  createLeaveType,
  deleteLeaveType
} = require('../controllers/leaveTypeController');



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

router.post(
  '/departments',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  createDepartment
);

router.delete(
  '/departments/:department_id',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  deleteDepartment
);

router.get(
  '/leave-types',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  getAllLeaveTypes
);

router.post(
  '/leave-types',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  createLeaveType
);

router.delete(
  '/leave-types/:leave_type_id',
  authenticateToken,
  authorizeRoles('HR/Admin'),
  deleteLeaveType
);

module.exports = router;
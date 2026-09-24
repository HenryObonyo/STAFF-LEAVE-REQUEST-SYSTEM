const pool = require("../config/db");
const logAudit = require("../utils/auditLogger");

const getAllEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        u.user_id,
        u.name,
        u.email,
        u.role,
        u.is_active,
        d.name AS department,
        m.name AS manager,
        u.created_at
       FROM users u
       LEFT JOIN departments d
         ON u.department_id = d.department_id
       LEFT JOIN users m
         ON u.manager_id = m.user_id
       ORDER BY u.created_at DESC`,
    );

    res.status(200).json({
      message: "Employees retrieved successfully",
      employees: result.rows,
    });
  } catch (error) {
    console.error("Get all employees error:", error);

    res.status(500).json({
      message: "Server error while retrieving employees",
    });
  }
};

const getAllLeaveRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        lr.leave_request_id,
        lr.employee_id,
        u.name AS employee_name,
        u.email AS employee_email,
        d.name AS department,
        lt.name AS leave_type,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status,
        lr.submitted_at,
        lr.decided_at,
        lr.decided_by,
        dec.name AS decided_by_name,
        lr.decision_reason
       FROM leave_requests lr
       JOIN users u
         ON lr.employee_id = u.user_id
       LEFT JOIN departments d
         ON u.department_id = d.department_id
       JOIN leave_types lt
         ON lr.leave_type_id = lt.leave_type_id
       LEFT JOIN users dec
         ON lr.decided_by = dec.user_id
       ORDER BY lr.submitted_at DESC`,
    );

    res.status(200).json({
      message: "All leave requests retrieved successfully",
      leaveRequests: result.rows,
    });
  } catch (error) {
    console.error("Get all leave requests error:", error);

    res.status(500).json({
      message: "Server error while retrieving leave requests",
    });
  }
};

const approveManagerLeaveRequest = async (req, res) => {
  try {
    const admin_id = req.user.user_id;
    const { id } = req.params;

    const existingRequest = await pool.query(
      `SELECT
        lr.leave_request_id,
        lr.employee_id,
        lr.status,
        u.role AS employee_role
       FROM leave_requests lr
       JOIN users u
         ON lr.employee_id = u.user_id
       WHERE lr.leave_request_id = $1`,
      [id],
    );

    if (existingRequest.rows.length === 0) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    const request = existingRequest.rows[0];

    if (request.employee_role !== "Manager") {
      return res.status(400).json({
        message: "This endpoint is only for manager leave requests",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending leave requests can be approved",
      });
    }

    const result = await pool.query(
      `UPDATE leave_requests
       SET
         status = 'Approved',
         decided_at = NOW(),
         decided_by = $1,
         decision_reason = NULL,
         updated_at = NOW()
       WHERE leave_request_id = $2
       RETURNING *`,
      [admin_id, id],
    );

    await logAudit({
      user_id: admin_id,
      action: "APPROVE",
      entity: "leave_request",
      entity_id: result.rows[0].leave_request_id,
      description: "Admin approved a manager leave request",
    });

    res.status(200).json({
      message: "Manager leave request approved successfully",
      leaveRequest: result.rows[0],
    });
  } catch (error) {
    console.error("Approve manager leave request error:", error);

    res.status(500).json({
      message: "Server error while approving manager leave request",
    });
  }
};

const rejectManagerLeaveRequest = async (req, res) => {
  try {
    const admin_id = req.user.user_id;
    const { id } = req.params;
    const { decision_reason } = req.body;

    if (!decision_reason || !decision_reason.trim()) {
      return res.status(400).json({
        message: "A rejection reason is required",
      });
    }

    const existingRequest = await pool.query(
      `SELECT
        lr.leave_request_id,
        lr.employee_id,
        lr.status,
        u.role AS employee_role
       FROM leave_requests lr
       JOIN users u
         ON lr.employee_id = u.user_id
       WHERE lr.leave_request_id = $1`,
      [id],
    );

    if (existingRequest.rows.length === 0) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    const request = existingRequest.rows[0];

    if (request.employee_role !== "Manager") {
      return res.status(400).json({
        message: "This endpoint is only for manager leave requests",
      });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending leave requests can be rejected",
      });
    }

    const result = await pool.query(
      `UPDATE leave_requests
       SET
         status = 'Rejected',
         decided_at = NOW(),
         decided_by = $1,
         decision_reason = $2,
         updated_at = NOW()
       WHERE leave_request_id = $3
       RETURNING *`,
      [admin_id, decision_reason.trim(), id],
    );

    await logAudit({
      user_id: admin_id,
      action: "REJECT",
      entity: "leave_request",
      entity_id: result.rows[0].leave_request_id,
      description: `HR/Admin rejected a manager leave request: ${decision_reason.trim()}`,
    });

    res.status(200).json({
      message: "Manager leave request rejected successfully",
      leaveRequest: result.rows[0],
    });
  } catch (error) {
    console.error("Reject manager leave request error:", error);

    res.status(500).json({
      message: "Server error while rejecting manager leave request",
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await pool.query(
      `SELECT COUNT(*) AS count
       FROM users
       WHERE role IN ('Employee', 'Manager')
       AND is_active = true`,
    );

    const totalRequests = await pool.query(
      `SELECT COUNT(*) AS count
       FROM leave_requests`,
    );

    const pendingRequests = await pool.query(
      `SELECT COUNT(*) AS count
       FROM leave_requests
       WHERE status = 'Pending'`,
    );

    const approvedRequests = await pool.query(
      `SELECT COUNT(*) AS count
       FROM leave_requests
       WHERE status = 'Approved'`,
    );

    const rejectedRequests = await pool.query(
      `SELECT COUNT(*) AS count
       FROM leave_requests
       WHERE status = 'Rejected'`,
    );

    const leaveByType = await pool.query(
      `SELECT
      lt.name AS leave_type,
      COUNT(lr.leave_request_id) AS request_count
   FROM leave_requests lr
   JOIN leave_types lt
     ON lr.leave_type_id = lt.leave_type_id
   GROUP BY lt.name
   ORDER BY request_count DESC`,
    );

    const leaveByDepartment = await pool.query(
      `SELECT
      COALESCE(d.name, 'Unassigned') AS department,
      COUNT(lr.leave_request_id) AS request_count
   FROM leave_requests lr
   JOIN users u
     ON lr.employee_id = u.user_id
   LEFT JOIN departments d
     ON u.department_id = d.department_id
   GROUP BY COALESCE(d.name, 'Unassigned')
   ORDER BY request_count DESC`,
    );


    const leaveByMonth = await pool.query(
      `SELECT
      TO_CHAR(start_date, 'YYYY-MM') AS month,
      COUNT(leave_request_id) AS request_count
   FROM leave_requests
   GROUP BY TO_CHAR(start_date, 'YYYY-MM')
   ORDER BY month ASC`,
    );


    const averageLeaveDuration = await pool.query(
      `SELECT
      ROUND(AVG((end_date - start_date) + 1), 2) AS average_days
   FROM leave_requests`,
    );


    const decisionRates = await pool.query(
      `SELECT
      COUNT(*) FILTER (WHERE status = 'Approved') AS approved_count,
      COUNT(*) FILTER (WHERE status = 'Rejected') AS rejected_count,
      COUNT(*) AS decided_count
   FROM leave_requests
   WHERE status IN ('Approved', 'Rejected')`,
    );



    const approvedCount = Number(
      decisionRates.rows[0].approved_count || 0
    );

    const rejectedCount = Number(
      decisionRates.rows[0].rejected_count || 0
    );

    const decidedCount = Number(
      decisionRates.rows[0].decided_count || 0
    );

    const approvalRate = decidedCount > 0
      ? Number(((approvedCount / decidedCount) * 100).toFixed(2))
      : 0;

    const rejectionRate = decidedCount > 0
      ? Number(((rejectedCount / decidedCount) * 100).toFixed(2))
      : 0;



    res.status(200).json({
      message: "Dashboard statistics retrieved successfully",
      statistics: {
        totalEmployees: Number(totalEmployees.rows[0].count),
        totalRequests: Number(totalRequests.rows[0].count),
        pendingRequests: Number(pendingRequests.rows[0].count),
        approvedRequests: Number(approvedRequests.rows[0].count),
        rejectedRequests: Number(rejectedRequests.rows[0].count),
        leaveByType: leaveByType.rows,
        leaveByDepartment: leaveByDepartment.rows,
        leaveByMonth: leaveByMonth.rows,
        averageLeaveDuration: Number(averageLeaveDuration.rows[0].average_days),
        decisionRates: {
          approved: approvedCount,
          rejected: rejectedCount,
          total: decidedCount,
          approvalRate: approvalRate,
          rejectionRate: rejectionRate,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard statistics error:", error);

    res.status(500).json({
      message: "Server error while retrieving dashboard statistics",
    });
  }
};

module.exports = {
  getAllEmployees,
  getAllLeaveRequests,
  approveManagerLeaveRequest,
  rejectManagerLeaveRequest,
  getDashboardStats,
};

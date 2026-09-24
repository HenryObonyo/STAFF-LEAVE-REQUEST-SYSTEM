const pool = require('../config/db');
const logAudit = require('../utils/auditLogger');

const getPendingTeamRequests = async (req, res) => {
  try {
    const manager_id = req.user.user_id;

    const result = await pool.query(
      `SELECT
        lr.leave_request_id,
        lr.employee_id,
        u.name AS employee_name,
        u.email AS employee_email,
        d.name AS department,
        lr.leave_type_id,
        lt.name AS leave_type,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status,
        lr.submitted_at
       FROM leave_requests lr
       JOIN users u
         ON lr.employee_id = u.user_id
       LEFT JOIN departments d
         ON u.department_id = d.department_id
       JOIN leave_types lt
         ON lr.leave_type_id = lt.leave_type_id
       WHERE u.manager_id = $1
       AND lr.status = 'Pending'
       ORDER BY lr.submitted_at ASC`,
      [manager_id]
    );

    res.status(200).json({
      message: 'Pending team leave requests retrieved successfully',
      leaveRequests: result.rows
    });

  } catch (error) {
    console.error('Get pending team requests error:', error);

    res.status(500).json({
      message: 'Server error while retrieving team leave requests'
    });
  }
};


const getTeamLeaveRequestById = async (req, res) => {
  try {
    const manager_id = req.user.user_id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        lr.leave_request_id,
        lr.employee_id,
        u.name AS employee_name,
        u.email AS employee_email,
        d.name AS department,
        lr.leave_type_id,
        lt.name AS leave_type,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status,
        lr.submitted_at,
        lr.decided_at,
        lr.decided_by,
        lr.decision_reason
       FROM leave_requests lr
       JOIN users u
         ON lr.employee_id = u.user_id
       LEFT JOIN departments d
         ON u.department_id = d.department_id
       JOIN leave_types lt
         ON lr.leave_type_id = lt.leave_type_id
       WHERE lr.leave_request_id = $1
       AND u.manager_id = $2`,
      [id, manager_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Leave request not found or you do not have permission to view it'
      });
    }

    res.status(200).json({
      message: 'Leave request retrieved successfully',
      leaveRequest: result.rows[0]
    });

  } catch (error) {
    console.error('Get team leave request error:', error);

    res.status(500).json({
      message: 'Server error while retrieving leave request'
    });
  }
};




const approveLeaveRequest = async (req, res) => {
  try {
    const manager_id = req.user.user_id;
    const { id } = req.params;

    const existingRequest = await pool.query(
      `SELECT
        lr.leave_request_id,
        lr.employee_id,
        lr.status,
        u.manager_id
       FROM leave_requests lr
       JOIN users u
         ON lr.employee_id = u.user_id
       WHERE lr.leave_request_id = $1`,
      [id]
    );

    if (existingRequest.rows.length === 0) {
      return res.status(404).json({
        message: 'Leave request not found'
      });
    }

    const request = existingRequest.rows[0];

    if (request.employee_id === manager_id) {
      return res.status(403).json({
        message: 'You cannot approve your own leave request'
      });
    }

    if (request.manager_id !== manager_id) {
      return res.status(403).json({
        message: 'You do not have permission to approve this leave request'
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending leave requests can be approved'
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
      [manager_id, id]
    );

    await logAudit({
      user_id: manager_id,
      action: 'APPROVE',
      entity: 'leave_request',
      entity_id: result.rows[0].leave_request_id,
      description: 'Manager approved a leave request'
    });




    res.status(200).json({
      message: 'Leave request approved successfully',
      leaveRequest: result.rows[0]
    });

  } catch (error) {
    console.error('Approve leave request error:', error);

    res.status(500).json({
      message: 'Server error while approving leave request'
    });
  }
};



const rejectLeaveRequest = async (req, res) => {
  try {
    const manager_id = req.user.user_id;
    const { id } = req.params;
    const { decision_reason } = req.body;

    if (!decision_reason || !decision_reason.trim()) {
      return res.status(400).json({
        message: 'A rejection reason is required'
      });
    }

    const existingRequest = await pool.query(
      `SELECT
        lr.leave_request_id,
        lr.employee_id,
        lr.status,
        u.manager_id
       FROM leave_requests lr
       JOIN users u
         ON lr.employee_id = u.user_id
       WHERE lr.leave_request_id = $1`,
      [id]
    );

    if (existingRequest.rows.length === 0) {
      return res.status(404).json({
        message: 'Leave request not found'
      });
    }

    const request = existingRequest.rows[0];

    if (request.employee_id === manager_id) {
      return res.status(403).json({
        message: 'You cannot reject your own leave request'
      });
    }

    if (request.manager_id !== manager_id) {
      return res.status(403).json({
        message: 'You do not have permission to reject this leave request'
      });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending leave requests can be rejected'
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
      [manager_id, decision_reason.trim(), id]
    );



    await logAudit({
      user_id: manager_id,
      action: 'REJECT',
      entity: 'leave_request',
      entity_id: result.rows[0].leave_request_id,
      description: `Manager rejected a leave request: ${decision_reason.trim()}`
    });


    res.status(200).json({
      message: 'Leave request rejected successfully',
      leaveRequest: result.rows[0]
    });

  } catch (error) {
    console.error('Reject leave request error:', error);

    res.status(500).json({
      message: 'Server error while rejecting leave request'
    });
  }
};



module.exports = {
  getPendingTeamRequests,
  getTeamLeaveRequestById,
  approveLeaveRequest,
  rejectLeaveRequest
};
const pool = require('../config/db');
const logAudit = require('../utils/auditLogger');


// Submit a new leave request
const submitLeaveRequest = async (req, res) => {
  try {
    const {
      leave_type_id,
      start_date,
      end_date,
      reason
    } = req.body;

    const employee_id = req.user.user_id;

    // Validate required fields
    if (!leave_type_id || !start_date || !end_date || !reason) {
      return res.status(400).json({
        message: 'Leave type, start date, end date and reason are required'
      });
    }

    // Validate dates
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        message: 'End date cannot be before start date'
      });
    }

    // Check that leave type exists and is active
    const leaveType = await pool.query(
      `SELECT leave_type_id
       FROM leave_types
       WHERE leave_type_id = $1
       AND is_active = true`,
      [leave_type_id]
    );

    if (leaveType.rows.length === 0) {
      return res.status(400).json({
        message: 'Invalid or inactive leave type'
      });
    }

    // Create leave request
    const result = await pool.query(
      `INSERT INTO leave_requests
        (
          employee_id,
          leave_type_id,
          start_date,
          end_date,
          reason,
          status,
          submitted_at
        )
       VALUES
        ($1, $2, $3, $4, $5, 'Pending', NOW())
       RETURNING *`,
      [
        employee_id,
        leave_type_id,
        start_date,
        end_date,
        reason
      ]
    );

    await logAudit({
      user_id: employee_id,
      action: 'SUBMIT',
      entity: 'leave_request',
      entity_id: result.rows[0].leave_request_id,
      description: 'Employee submitted a leave request'
    });


    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest: result.rows[0]
    });

  } catch (error) {
    console.error('Submit leave request error:', error);

    res.status(500).json({
      message: 'Server error while submitting leave request'
    });
  }
};


// Get logged-in employee's leave requests
const getMyLeaveRequests = async (req, res) => {
  try {
    const employee_id = req.user.user_id;

    const result = await pool.query(
      `SELECT
        lr.leave_request_id,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status,
        lr.submitted_at,
        lr.decided_at,
        lr.decision_reason,
        lt.name AS leave_type
       FROM leave_requests lr
       JOIN leave_types lt
         ON lr.leave_type_id = lt.leave_type_id
       WHERE lr.employee_id = $1
       ORDER BY lr.created_at DESC`,
      [employee_id]
    );

    res.status(200).json({
      message: 'Leave requests retrieved successfully',
      leaveRequests: result.rows
    });

  } catch (error) {
    console.error('Get leave requests error:', error);

    res.status(500).json({
      message: 'Server error while retrieving leave requests'
    });
  }
};


// Get one leave request belonging to logged-in employee
const getMyLeaveRequestById = async (req, res) => {
  try {
    const employee_id = req.user.user_id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        lr.leave_request_id,
        lr.employee_id,
        lr.leave_type_id,
        lr.start_date,
        lr.end_date,
        lr.reason,
        lr.status,
        lr.submitted_at,
        lr.decided_at,
        lr.decision_reason,
        lt.name AS leave_type
       FROM leave_requests lr
       JOIN leave_types lt
         ON lr.leave_type_id = lt.leave_type_id
       WHERE lr.leave_request_id = $1
       AND lr.employee_id = $2`,
      [id, employee_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Leave request not found'
      });
    }

    res.status(200).json({
      message: 'Leave request retrieved successfully',
      leaveRequest: result.rows[0]
    });

  } catch (error) {
    console.error('Get leave request error:', error);

    res.status(500).json({
      message: 'Server error while retrieving leave request'
    });
  }
};


// Edit a pending leave request
const updateLeaveRequest = async (req, res) => {
  try {
    const employee_id = req.user.user_id;
    const { id } = req.params;

    const {
      leave_type_id,
      start_date,
      end_date,
      reason
    } = req.body;

    // Check existing request
    const existingRequest = await pool.query(
      `SELECT *
       FROM leave_requests
       WHERE leave_request_id = $1
       AND employee_id = $2`,
      [id, employee_id]
    );

    if (existingRequest.rows.length === 0) {
      return res.status(404).json({
        message: 'Leave request not found'
      });
    }

    const request = existingRequest.rows[0];

    // Only pending requests can be edited
    if (request.status !== 'Pending') {
      return res.status(400).json({
        message: 'Only pending leave requests can be edited'
      });
    }

    // Validate required fields
    if (!leave_type_id || !start_date || !end_date || !reason) {
      return res.status(400).json({
        message: 'Leave type, start date, end date and reason are required'
      });
    }

    // Validate dates
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        message: 'End date cannot be before start date'
      });
    }

    // Check leave type
    const leaveType = await pool.query(
      `SELECT leave_type_id
       FROM leave_types
       WHERE leave_type_id = $1
       AND is_active = true`,
      [leave_type_id]
    );

    if (leaveType.rows.length === 0) {
      return res.status(400).json({
        message: 'Invalid or inactive leave type'
      });
    }

    // Update request
    const result = await pool.query(
      `UPDATE leave_requests
       SET
         leave_type_id = $1,
         start_date = $2,
         end_date = $3,
         reason = $4,
         updated_at = NOW()
       WHERE leave_request_id = $5
       AND employee_id = $6
       RETURNING *`,
      [
        leave_type_id,
        start_date,
        end_date,
        reason,
        id,
        employee_id
      ]
    );


    await logAudit({
      user_id: employee_id,
      action: 'UPDATE',
      entity: 'leave_request',
      entity_id: result.rows[0].leave_request_id,
      description: 'Employee updated a pending leave request'
    });





    res.status(200).json({
      message: 'Leave request updated successfully',
      leaveRequest: result.rows[0]
    });

  } catch (error) {
    console.error('Update leave request error:', error);

    res.status(500).json({
      message: 'Server error while updating leave request'
    });
  }
};


module.exports = {
  submitLeaveRequest,
  getMyLeaveRequests,
  getMyLeaveRequestById,
  updateLeaveRequest
};
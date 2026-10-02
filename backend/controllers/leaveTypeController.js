const pool = require('../config/db');
const logAudit = require('../utils/auditLogger');

const getLeaveTypes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        leave_type_id,
        name
       FROM leave_types
       WHERE is_active = true
       ORDER BY leave_type_id`
    );

    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Get leave types error:', error);

    res.status(500).json({
      message: 'Server error while retrieving leave types'
    });
  }
};



const getAllLeaveTypes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        leave_type_id,
        name,
        description,
        is_active,
        created_at
       FROM leave_types
       ORDER BY leave_type_id ASC`
    );

    res.status(200).json({
      message: 'Leave types retrieved successfully',
      leaveTypes: result.rows
    });

  } catch (error) {
    console.error('Get all leave types error:', error);

    res.status(500).json({
      message: 'Server error while retrieving leave types'
    });
  }
};


const createLeaveType = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Leave type name is required'
      });
    }

    const leaveTypeName = name.trim();

    const leaveTypeDescription = description
      ? description.trim()
      : null;

    // Prevent duplicate leave type names
    const existingLeaveType = await pool.query(
      `SELECT leave_type_id
       FROM leave_types
       WHERE LOWER(name) = LOWER($1)`,
      [leaveTypeName]
    );

    if (existingLeaveType.rows.length > 0) {
      return res.status(409).json({
        message: 'A leave type with this name already exists'
      });
    }

    const result = await pool.query(
      `INSERT INTO leave_types
        (name, description, is_active)
       VALUES ($1, $2, true)
       RETURNING
        leave_type_id,
        name,
        description,
        is_active,
        created_at`,
      [leaveTypeName, leaveTypeDescription]
    );

    await logAudit({
      user_id: req.user.user_id,
      action: 'CREATE',
      entity: 'leave_type',
      entity_id: result.rows[0].leave_type_id,
      description:
        `HR/Admin created leave type: ${leaveTypeName}`
    });

    res.status(201).json({
      message: 'Leave type created successfully',
      leaveType: result.rows[0]
    });

  } catch (error) {
    console.error('Create leave type error:', error);

    res.status(500).json({
      message: 'Server error while creating leave type'
    });
  }
};

const deleteLeaveType = async (req, res) => {
  try {
    const { leave_type_id } = req.params;

    const leaveTypeResult = await pool.query(
      `SELECT
        leave_type_id,
        name
       FROM leave_types
       WHERE leave_type_id = $1`,
      [leave_type_id]
    );

    if (leaveTypeResult.rows.length === 0) {
      return res.status(404).json({
        message: 'Leave type not found'
      });
    }

    const leaveType = leaveTypeResult.rows[0];

    // Check whether this leave type is already being used
    const usageResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM leave_requests
       WHERE leave_type_id = $1`,
      [leave_type_id]
    );

    const usageCount = Number(usageResult.rows[0].count);

    if (usageCount > 0) {
      return res.status(409).json({
        message:
          `Cannot delete ${leaveType.name} because it is already ` +
          `used by ${usageCount} leave request(s).`
      });
    }

    await pool.query(
      `DELETE FROM leave_types
       WHERE leave_type_id = $1`,
      [leave_type_id]
    );

    await logAudit({
      user_id: req.user.user_id,
      action: 'DELETE',
      entity: 'leave_type',
      entity_id: leave_type_id,
      description:
        `HR/Admin deleted leave type: ${leaveType.name}`
    });

    res.status(200).json({
      message: 'Leave type deleted successfully'
    });

  } catch (error) {
    console.error('Delete leave type error:', error);

    res.status(500).json({
      message: 'Server error while deleting leave type'
    });
  }
};


module.exports = {
  getLeaveTypes,
  getAllLeaveTypes,
  createLeaveType,
  deleteLeaveType
};
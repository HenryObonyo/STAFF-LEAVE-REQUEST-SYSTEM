const pool = require('../config/db');

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

module.exports = {
  getLeaveTypes
};
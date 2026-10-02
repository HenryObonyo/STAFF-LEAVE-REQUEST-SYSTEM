const bcrypt = require('bcryptjs');
const pool = require('../config/db');


// Get logged-in user's profile
const getMyProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const result = await pool.query(
      `SELECT
        user_id,
        name,
        email,
        role,
        department_id,
        manager_id,
        is_active
       FROM users
       WHERE user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);

    res.status(500).json({
      message: 'Server error while retrieving profile'
    });
  }
};


// Update logged-in user's name and email
const updateMyProfile = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required'
      });
    }

    const existingUser = await pool.query(
      `SELECT user_id
       FROM users
       WHERE email = $1
       AND user_id != $2`,
      [email, user_id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists'
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET
         name = $1,
         email = $2
       WHERE user_id = $3
       RETURNING
         user_id,
         name,
         email,
         role,
         department_id,
         manager_id,
         is_active`,
      [name, email, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);

    res.status(500).json({
      message: 'Server error while updating profile'
    });
  }
};


// Change logged-in user's password
const changeMyPassword = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const {
      currentPassword,
      newPassword
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long'
      });
    }

    const result = await pool.query(
      `SELECT password_hash
       FROM users
       WHERE user_id = $1`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User account not found'
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      });
    }

    const newPasswordHash = await bcrypt.hash(
      newPassword,
      10
    );

    await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE user_id = $2`,
      [newPasswordHash, user_id]
    );

    res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);

    res.status(500).json({
      message: 'Server error while changing password'
    });
  }
};


module.exports = {
  getMyProfile,
  updateMyProfile,
  changeMyPassword
};
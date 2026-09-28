const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const register = async (req, res) => {
  try {
    const { name, email, password, department_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
        (name, email, password_hash, role, department_id)
       VALUES
        ($1, $2, $3, 'Employee', $4)
       RETURNING user_id, name, email, role, department_id`,
      [
        name,
        email,
        passwordHash,
        department_id || null
      ]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    res.status(201).json({
      message: 'Employee account created successfully',
      token,
      user
    });

  } catch (error) {
    console.error('Registration error:', error);

    res.status(500).json({
      message: 'Server error during registration'
    });
  }
};


const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      department_id
    } = req.body;

    // Validate required fields
    if (!name || !email || !role || !department_id) {
      return res.status(400).json({
        message: 'Name, email, role and department are required'
      });
    }

    // Only Employee or Manager can be created through this function
    if (!['Employee', 'Manager'].includes(role)) {
      return res.status(400).json({
        message: 'Role must be Employee or Manager'
      });
    }

    // Check whether email already exists
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists'
      });
    }

    // Default password
    const defaultPassword = 'Welcome@123';

    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await pool.query(
      `INSERT INTO users
        (name, email, password_hash, role, department_id)
       VALUES
        ($1, $2, $3, $4, $5)
       RETURNING
        user_id,
        name,
        email,
        role,
        department_id,
        is_active`,
      [
        name,
        email,
        passwordHash,
        role,
        department_id
      ]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: 'Employee account created successfully',
      user,
      defaultPassword
    });

  } catch (error) {
    console.error('Create employee error:', error);

    res.status(500).json({
      message: 'Server error while creating employee account'
    });
  }
};






const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const result = await pool.query(
      `SELECT
        user_id,
        name,
        email,
        password_hash,
        role,
        department_id,
        manager_id,
        is_active
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        message: 'This account is inactive'
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    delete user.password_hash;

    res.status(200).json({
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Server error during login'
    });
  }
};


module.exports = {
  register,
  createEmployee,
  login
};
const express = require('express');

const {
  getLeaveTypes
} = require('../controllers/leaveTypeController');

const router = express.Router();

router.get('/', getLeaveTypes);

module.exports = router;
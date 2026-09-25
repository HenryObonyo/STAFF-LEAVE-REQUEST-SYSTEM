const pool = require('../config/db');

const logAudit = async ({
  user_id,
  action,
  entity,
  entity_id,
  description
}) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs
        (
          user_id,
          action,
          entity,
          entity_id,
          description
        )
       VALUES
        ($1, $2, $3, $4, $5)`,
      [
        user_id,
        action,
        entity,
        entity_id,
        description
      ]
    );
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};

module.exports = logAudit;
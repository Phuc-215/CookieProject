var express = require('express');
var router = express.Router();
var { pool } = require('../config/db');

router.get('/test-db', async function(req, res) {
  const result = await pool.query('SELECT id, username FROM users');
  res.json(result.rows);
});

module.exports = router;

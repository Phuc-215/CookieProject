const { pool } = require('../config/db');

exports.getAll = async () => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT c.*
      FROM public.categories c
    `;
    const res = await client.query(query);
    return res.rows;

  } finally {
    client.release();
  }
};

const { pool } = require('../config/db');

exports.getIngredients = async () => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT i.*
      FROM public.ingredients i
    `;
    const res = await client.query(query);
    return res.rows;

  } finally {
    client.release();
  }
};
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function connectDB() {
  try {
    await pool.query('SELECT 1')
    console.log('PostgreSQL connected')
  } catch (err) {
    console.error('DB connection error:', err)
    process.exit(1)
  }
}

module.exports = {
  pool,
  connectDB
}

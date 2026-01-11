import dotenv from 'dotenv'
dotenv.config()

export const env = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,

  db: {
    url: process.env.DATABASE_URL
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  }
}
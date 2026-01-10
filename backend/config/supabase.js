const { createClient } = require('@supabase/supabase-js');

// Use service role for server-side operations (avatar upload, etc.)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };

const { createClient } = require("@supabase/supabase-js");

let _client = null;

function getSupabase() {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL o SUPABASE_SERVICE_KEY no configurados");
    _client = createClient(url, key);
  }
  return _client;
}

module.exports = { getSupabase };

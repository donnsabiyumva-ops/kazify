import { createClient } from "@supabase/supabase-js";

// Service-role client for serverless functions only — bypasses RLS
// deliberately, since this is exactly the server-side trust boundary
// supabase/rls-production-ready.sql's payouts comment anticipates
// ("writes happen via service-role from escrow-release/withdrawal server
// logic"). Never import this from src/ — it must not reach the browser
// bundle.
export const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

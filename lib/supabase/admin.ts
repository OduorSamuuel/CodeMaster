
import { createClient} from "@supabase/supabase-js";

export const createAdminClient = () => {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // Same project URL
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!, // Service role key (private)
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return supabaseAdmin;
};

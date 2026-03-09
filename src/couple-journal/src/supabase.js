import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rqaumnfzzbtleilortfe.supabase.co";
const supabaseKey = "sb_publishable_2mWN-7VaMR3XkoiC0I9bPg_wcfVmBZ6";

export const supabase = createClient(supabaseUrl, supabaseKey);

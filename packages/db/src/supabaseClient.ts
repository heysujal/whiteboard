import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types.js";
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from "./config.js"
const supabaseUrl = NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
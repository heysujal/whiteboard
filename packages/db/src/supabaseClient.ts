import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types.js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!




export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
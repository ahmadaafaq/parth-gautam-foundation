import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://ovfntwpehxejgwtcpifu.supabase.co"
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ewJkoeJsLgeq2bd8x_VKWg_cwBdbF80"

export const supabase = createClient(supabaseUrl, supabaseKey)

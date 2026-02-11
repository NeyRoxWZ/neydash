import { createClient as createClientJS } from "@supabase/supabase-js"

export function createClient() {
  return createClientJS(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_KEY || ''
  )
}

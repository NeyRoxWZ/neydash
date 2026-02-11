'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function loginWithDiscord() {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const origin = `${protocol}://${host}`

  console.log("Attempting Discord Login...")
  console.log("Origin:", origin)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("❌ Supabase OAuth Error:", error.message)
    // Rediriger avec le message d'erreur exact pour le voir dans l'URL
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    console.log("✅ Redirecting to Discord OAuth URL:", data.url)
    return redirect(data.url)
  }
}

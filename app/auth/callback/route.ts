import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

// PLACEHOLDER: REMPLACEZ CECI PAR VOTRE VRAI ID DISCORD
// Exemple: "345678901234567890"
const ALLOWED_DISCORD_ID = "566572805349572608"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check User ID
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Find Discord provider info
        const discordIdentity = user.identities?.find(id => id.provider === 'discord')
        const discordId = discordIdentity?.id || user.user_metadata?.provider_id || user.user_metadata?.sub

        // STRICT CHECK
        if (discordId !== ALLOWED_DISCORD_ID) {
          // Unauthorized: Sign out immediately
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=Unauthorized Discord Account`)
        }

        // Authorized: Mark device as trusted (skip 24h verify loop)
        const cookieStore = await cookies()
        let deviceId = cookieStore.get('device_id')?.value
        if (!deviceId) {
           deviceId = uuidv4()
           cookieStore.set('device_id', deviceId, { 
             secure: true, 
             httpOnly: true, 
             sameSite: 'lax',
             maxAge: 60 * 60 * 24 * 365 * 10 // 10 years
           })
        }

        // Upsert admin_devices record as trusted
        await supabase.from('admin_devices').upsert({
            user_id: user.id,
            device_id: deviceId,
            is_trusted: true,
            verified_at: new Date().toISOString(),
            last_used_at: new Date().toISOString(),
            last_ip: 'discord_login',
            user_agent_hash: 'discord_login'
        }, { onConflict: 'id' }) // Note: This might need better conflict handling if ID isn't known, but user_id+device_id logic is handled in code usually. 
        // Better:
        const { data: existingDevice } = await supabase
            .from('admin_devices')
            .select('id')
            .eq('user_id', user.id)
            .eq('device_id', deviceId)
            .single()

        if (existingDevice) {
             await supabase.from('admin_devices').update({
                 is_trusted: true,
                 verified_at: new Date().toISOString(),
                 last_used_at: new Date().toISOString()
             }).eq('id', existingDevice.id)
        } else {
             await supabase.from('admin_devices').insert({
                 user_id: user.id,
                 device_id: deviceId,
                 is_trusted: true,
                 verified_at: new Date().toISOString(),
                 last_used_at: new Date().toISOString(),
                 last_ip: 'discord_login',
                 user_agent_hash: 'discord_login'
             })
        }

        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Auth Error`)
}

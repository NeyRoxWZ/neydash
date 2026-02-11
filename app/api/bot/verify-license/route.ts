import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { licenseKey, guildId, actorDiscordId } = await request.json()

    if (!licenseKey) {
      return NextResponse.json({ valid: false, error: 'Missing license key' }, { status: 400 })
    }

    const supabase = await createClient(true)

    // 1. Récupérer la licence
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single()

    if (licenseError || !license) {
      return NextResponse.json({ valid: false, error: 'Invalid license' })
    }

    // 2. Vérifier l'expiration
    if (license.expiresat && new Date(license.expiresat) < new Date()) {
      return NextResponse.json({ valid: false, error: 'License expired', status: 'expired' })
    }

    // 3. Si la licence n'est pas encore liée, la lier à ce client/guild
    if (!license.client_id && actorDiscordId) {
      const { error: updateError } = await supabase
        .from('licenses')
        .update({ 
          client_id: actorDiscordId,
          status: 'active'
        })
        .eq('license_key', licenseKey)

      if (updateError) {
        console.error('Error binding license:', updateError)
      }
    }

    return NextResponse.json({ 
      valid: true, 
      status: 'active',
      expiresat: license.expiresat,
      client_id: license.client_id || actorDiscordId
    })

  } catch (err) {
    console.error('Verify license error:', err)
    return NextResponse.json({ valid: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

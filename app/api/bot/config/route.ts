import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient(true)
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Transformer en objet
    const config = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value
      return acc
    }, {})

    // Mapper les clés pour le bot (support_link -> support_url si nécessaire)
    return NextResponse.json({
      success: true,
      maintenance_mode: config.maintenance_mode === 'true',
      support_url: config.support_link || '',
      bot_version: config.bot_version || '1.0.0'
    })
  } catch (err) {
    console.error('API Config error:', err)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}

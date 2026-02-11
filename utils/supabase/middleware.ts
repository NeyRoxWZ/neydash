import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Environment Variables in Middleware')
    // Fail gracefully or let it crash with a clear error if preferred
    // For Vercel logs, console.error is good.
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Device Validation Logic
  if (user && !request.nextUrl.pathname.startsWith('/verify-device') && !request.nextUrl.pathname.startsWith('/auth')) {
     const deviceId = request.cookies.get('device_id')?.value;
     
     if (deviceId) {
        // Check if device is trusted and session is fresh (< 24h)
        const { data: device, error } = await supabase
          .from('admin_devices')
          .select('is_trusted, verified_at')
          .eq('user_id', user.id)
          .eq('device_id', deviceId)
          .single()
        
        // Calculate hours since last verification
        const now = new Date();
        const verifiedAt = device?.verified_at ? new Date(device.verified_at) : null;
        const hoursSinceVerify = verifiedAt ? (now.getTime() - verifiedAt.getTime()) / (1000 * 60 * 60) : 999;
        
        // Redirect if:
        // 1. Device record missing
        // 2. Device not trusted
        // 3. Verification older than 24 hours (Force Re-verify)
        // AND ONLY IF we are not already on the verify-device page (redundant check but safe)
        if (!error && (!device || !device.is_trusted || hoursSinceVerify > 24)) {
             // Avoid infinite redirect loop
             if (!request.nextUrl.pathname.startsWith('/verify-device')) {
                 const url = request.nextUrl.clone()
                 url.pathname = '/verify-device'
                 return NextResponse.redirect(url)
             }
        }
     } else {
        // No device ID cookie found for logged in user -> Force verify flow to generate one
         if (!request.nextUrl.pathname.startsWith('/verify-device')) {
             const url = request.nextUrl.clone()
             url.pathname = '/verify-device'
             return NextResponse.redirect(url)
         }
     }
  }

  return supabaseResponse
}

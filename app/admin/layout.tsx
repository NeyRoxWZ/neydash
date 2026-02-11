import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { CommandMenu } from '@/components/command-menu'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Transform user to simple object to avoid serialization errors
  const safeUser = JSON.parse(JSON.stringify(user))

  return (
    <div className="flex min-h-screen bg-background">
      <CommandMenu />
      {/* Mobile Sidebar & Trigger */}
      <MobileSidebar user={safeUser} />

      {/* Desktop Sidebar - Fixed */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <Sidebar user={safeUser} />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pl-[250px] w-full">
        <div className="container mx-auto p-4 pt-16 md:p-8 md:pt-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}

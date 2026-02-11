"use client"

import Link from "next/link"
import { LayoutDashboard, Settings, Key, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { NavItem } from "./nav-item"
import { UserNav, SafeUser } from "./user-nav"

interface SidebarProps {
  user: SafeUser | null
  className?: string
}

export function Sidebar({ user, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-screen w-[250px] flex-col border-r border-border bg-background",
        className
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <img 
            src="https://cdn.discordapp.com/icons/1165696765480153119/a_3f8b2c1d9e4f7a6b5c8d1e9f2a3b4c5d.png?size=128" 
            alt="Logo" 
            className="h-7 w-7 rounded-md object-cover border border-white/10"
            onError={(e) => {
              // Fallback si l'image ne charge pas
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
            }}
          />
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 hidden fallback-icon" />
          <span>NeySlotBot</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="flex flex-col gap-1">
          <NavItem href="/admin" label="Dashboard" icon={LayoutDashboard} />
          <NavItem href="/admin/licenses" label="Licenses" icon={Key} />
          <NavItem href="/admin/instances" label="Instances" icon={Server} />
          <NavItem href="/admin/settings" label="Settings" icon={Settings} />
        </nav>
      </div>

      <UserNav user={user} />
    </aside>
  )
}

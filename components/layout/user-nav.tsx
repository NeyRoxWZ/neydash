"use client"

import { LogOut, Settings, MoreVertical } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface SafeUser {
  id: string
  email?: string
  user_metadata: {
    avatar_url?: string
    picture?: string
    full_name?: string
    name?: string
    [key: string]: any
  }
}

interface UserNavProps {
  user: SafeUser | null
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  // Mock data if metadata is missing, assuming Discord auth usually provides these
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture
  const name = user.user_metadata?.full_name || user.user_metadata?.name || "User"
  const email = user.email

  return (
    <div className="border-t border-border p-4">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-secondary",
            isOpen && "bg-secondary"
          )}
        >
          <div className="h-9 w-9 overflow-hidden rounded-full bg-muted border border-border flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-muted-foreground">
                {name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-primary">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-full rounded-md border border-border bg-popover p-1 shadow-lg bg-[#09090b]">
            <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-primary">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <form action="/auth/signout" method="post" className="w-full">
              <button className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

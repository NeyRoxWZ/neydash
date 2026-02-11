"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  className?: string
}

export function NavItem({ href, label, icon: Icon, className }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-secondary hover:text-primary",
        isActive && "bg-secondary text-primary",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          isActive ? "text-indigo-400" : "text-muted-foreground group-hover:text-primary"
        )}
      />
      <span>{label}</span>
    </Link>
  )
}

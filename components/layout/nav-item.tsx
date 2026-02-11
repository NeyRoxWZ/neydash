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
  
  // Si c'est le dashboard (/admin), on veut une correspondance exacte
  // Sinon, pour les autres (/admin/licenses, etc.), on veut que ça reste actif si on est dans un sous-chemin
  const isActive = href === "/admin" 
    ? (pathname === "/admin" || pathname === "/admin/")
    : (pathname === href || pathname.startsWith(`${href}/`))

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors group",
        "text-muted-foreground hover:bg-secondary/80 hover:text-primary",
        isActive ? "bg-secondary text-primary shadow-sm" : "transparent",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors",
          isActive ? "text-indigo-400" : "text-muted-foreground group-hover:text-primary"
        )}
      />
      <span>{label}</span>
    </Link>
  )
}

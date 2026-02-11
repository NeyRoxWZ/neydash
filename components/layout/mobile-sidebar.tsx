"use client"

import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"
import { SafeUser } from "./user-nav"

interface MobileSidebarProps {
  user: SafeUser | null
  logoUrl?: string
}

export function MobileSidebar({ user, logoUrl }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-3 z-40 p-2 text-muted-foreground hover:text-primary md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[250px] transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative h-full">
           {/* Close button inside sidebar */}
           <button 
             onClick={() => setIsOpen(false)}
             className="absolute right-4 top-4 z-50 p-1 text-muted-foreground hover:text-primary"
           >
             <X className="h-5 w-5" />
           </button>
           
           <Sidebar user={user} logoUrl={logoUrl} className="w-full border-r-0" />
        </div>
      </div>
    </>
  )
}

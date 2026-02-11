"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function Modal({ isOpen, onClose, children, title, description, className }: ModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div 
        className={cn(
          "relative z-50 w-full max-w-lg transform rounded-xl border border-[#27272a] bg-[#09090b] p-6 text-left shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] transition-all animate-in fade-in-90 zoom-in-95",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            {title && <h3 className="text-lg font-semibold leading-none tracking-tight text-[#fafafa]">{title}</h3>}
            {description && <p className="text-sm text-[#a1a1aa]">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4 text-[#a1a1aa]" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        {children}
      </div>
    </div>
  )
}

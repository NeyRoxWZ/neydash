"use client"

import { useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

export function SessionReset() {
  useEffect(() => {
    const reset = async () => {
      // Clear local storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Sign out from Supabase
      const supabase = createClient()
      await supabase.auth.signOut()
      
      console.log("Session forcefully reset")
    }
    
    reset()
  }, [])

  return null
}

"use server"

import { createClient } from "@/lib/supabase/server"
import { setMaintenanceMode } from "@/lib/orchestrator"
import { revalidatePath } from "next/cache"

export async function fetchSettingsAction() {
  const supabase = await createClient()
  
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    
  if (error) return { success: false, error: error.message }
  
  // Transform to object
  const settingsObj = settings.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value
    return acc
  }, {})
  
  return { success: true, settings: settingsObj }
}

export async function updateSettingAction(key: string, value: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })
    
  if (error) return { success: false, error: error.message }
  
  // Special case for maintenance mode: also tell orchestrator
  if (key === 'maintenance_mode') {
    await setMaintenanceMode(value === 'true')
  }
  
  revalidatePath('/admin/settings')
  revalidatePath('/admin')
  return { success: true }
}

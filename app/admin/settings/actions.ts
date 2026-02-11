"use server"

import { createClient } from '@/utils/supabase/server';
import { setMaintenanceMode } from "@/lib/orchestrator"
import { revalidatePath } from "next/cache"

export async function fetchSettingsAction() {
  const supabase = await createClient(true)
  const { data, error } = await supabase.from('settings').select('*')
  
  if (error) {
    console.error('Error fetching settings:', error)
    return { success: false, error: error.message }
  }
  
  const settingsObj = (data || []).reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value
    return acc
  }, {})

  return { success: true, settings: settingsObj }
}

export async function updateSettingAction(key: string, value: string) {
  const supabase = await createClient(true)
  
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

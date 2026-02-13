"use server"

import { getOrchestratorStatus, restartInstance, stopInstance, deleteInstance, launchInstance } from "@/lib/orchestrator"
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function fetchInstancesAction() {
  const status = await getOrchestratorStatus()
  if (!status || !status.success) {
    return { success: false, error: "Impossible de récupérer les instances" }
  }
  
  const bots = status.bots || []
  
  // Enrichir avec les données Discord de Supabase
  try {
    const supabase = await createClient(true)
    
    // On récupère toutes les licences pour faire une jointure propre
    const { data: licenses } = await supabase
      .from('licenses')
      .select('license_key, discord_username, discord_avatar, client_id')

    if (licenses) {
      const licenseMap = new Map(licenses.map(l => [l.license_key, l]))
      bots.forEach((bot: any) => {
        if (bot.license_key && licenseMap.has(bot.license_key)) {
          const l = licenseMap.get(bot.license_key)
          if (l) {
            bot.discord_username = l.discord_username || "Utilisateur inconnu"
            bot.discord_avatar = l.discord_avatar
            bot.client_id = l.client_id
          }
        }
      });
    }
  } catch (err) {
    console.error('Error enriching instances:', err)
  }
  
  return { 
    success: true, 
    bots: bots,
    stats: status.stats || {}
  }
}

export async function restartInstanceAction(slot_id: number, type: 'slotbot' | 'botgestion', deploy_commands: boolean = false) {
  const res = await restartInstance(slot_id, type, deploy_commands)
  if (res.success) {
    revalidatePath('/admin/instances')
    revalidatePath('/admin')
  }
  return res
}

export async function stopInstanceAction(slot_id: number, type: 'slotbot' | 'botgestion') {
  const res = await stopInstance(slot_id, type)
  if (res.success) {
    revalidatePath('/admin/instances')
    revalidatePath('/admin')
  }
  return res
}

export async function deleteInstanceAction(slot_id: number, type: 'slotbot' | 'botgestion') {
  const res = await deleteInstance(slot_id, type)
  if (res.success) {
    revalidatePath('/admin/instances')
    revalidatePath('/admin')
  }
  return res
}

export async function launchInstanceAction(license_key: string, client_id: string) {
  try {
    const supabase = await createClient(true)
    const { data: tokenData } = await supabase
      .from('bottokens')
      .select('token_encrypted')
      .eq('license_key', license_key)
      .single()

    if (!tokenData || !tokenData.token_encrypted) {
      return { success: false, error: "Aucun token configuré pour cette licence." }
    }

    const res = await launchInstance(license_key, tokenData.token_encrypted, client_id)
    if (res.success) {
      revalidatePath('/admin/instances')
      revalidatePath('/admin')
    }
    return res
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

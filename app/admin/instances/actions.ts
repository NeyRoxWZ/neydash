"use server"

import { getOrchestratorStatus, restartInstance, stopInstance, deleteInstance } from "@/lib/orchestrator"
import { revalidatePath } from "next/cache"

export async function fetchInstancesAction() {
  const status = await getOrchestratorStatus()
  if (!status || !status.success) {
    return { success: false, error: "Impossible de récupérer les instances" }
  }
  
  return { 
    success: true, 
    bots: status.bots || [],
    stats: status.stats || {}
  }
}

export async function restartInstanceAction(slot_id: number, type: 'slotbot' | 'botgestion') {
  const res = await restartInstance(slot_id, type)
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

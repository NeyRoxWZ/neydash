'use server';

import { getOrchestratorStatus, restartBots, setMaintenanceMode } from '@/lib/orchestrator';
import { revalidatePath } from 'next/cache';

export async function getStatsAction() {
  return await getOrchestratorStatus();
}

export async function restartBotsAction(type?: 'slotbot' | 'botgestion') {
  const result = await restartBots(type);
  revalidatePath('/admin');
  return result;
}

export async function toggleMaintenanceAction(enabled: boolean) {
  const result = await setMaintenanceMode(enabled);
  revalidatePath('/admin');
  return result;
}

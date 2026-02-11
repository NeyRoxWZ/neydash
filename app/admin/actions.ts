'use server';

import { getOrchestratorStatus, restartBots, setMaintenanceMode } from '@/lib/orchestrator';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStatsAction() {
  const stats = await getOrchestratorStatus();
  
  // Si l'orchestrateur ne peut pas récupérer les infos de maintenance depuis Supabase
  // On le fait nous-mêmes avec les droits admin
  if (stats && stats.success) {
    const supabase = await createClient(true);
    const { data: maintenanceSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();
    
    return {
      ...stats,
      maintenance_mode: maintenanceSetting ? maintenanceSetting.value === 'true' : false
    };
  }
  
  return stats;
}

export async function restartBotsAction(type: 'all' | 'slotbot' | 'botgestion' = 'all') {
  const result = await restartBots(type);
  revalidatePath('/admin');
  return result;
}

export async function toggleMaintenanceAction(enabled: boolean) {
  const result = await setMaintenanceMode(enabled);
  revalidatePath('/admin');
  return result;
}

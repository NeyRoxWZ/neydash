const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL
const ORCHESTRATOR_SECRET = process.env.ORCHESTRATOR_SECRET

async function orchestratorFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${ORCHESTRATOR_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ORCHESTRATOR_SECRET}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`Orchestrator error: ${response.statusText}`)
  }
  return response.json()
}

export async function getOrchestratorStatus() {
  return orchestratorFetch('/api/stats')
}

export async function setMaintenanceMode(enabled: boolean) {
  return orchestratorFetch('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify({ maintenance_mode: enabled })
  })
}

export async function restartBots(type: 'all' | 'slotbot' | 'botgestion') {
  return orchestratorFetch('/api/restart-all', {
    method: 'POST',
    body: JSON.stringify({ type })
  })
}

export async function restartInstance(id: string | number, type: string) {
  return orchestratorFetch(`/api/instances/${id}/restart`, { 
    method: 'POST',
    body: JSON.stringify({ type })
  })
}

export async function stopInstance(id: string | number, type: string) {
  return orchestratorFetch(`/api/instances/${id}/stop`, { 
    method: 'POST',
    body: JSON.stringify({ type })
  })
}

export async function deleteInstance(id: string | number, type: string) {
  return orchestratorFetch(`/api/instances/${id}`, { 
    method: 'DELETE',
    body: JSON.stringify({ type })
  })
}

export async function getLogs(botId?: string, lines: number = 100) {
  let url = '/api/logs'
  const params = new URLSearchParams()
  if (botId) params.append('botId', botId)
  if (lines) params.append('lines', lines.toString())
  
  const queryString = params.toString()
  if (queryString) url += `?${queryString}`
  
  return orchestratorFetch(url)
}

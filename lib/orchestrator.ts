const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL
const ORCHESTRATOR_SECRET = process.env.ORCHESTRATOR_SECRET || ''

async function orchestratorFetch(path: string, options: RequestInit = {}) {
  if (!ORCHESTRATOR_URL) {
    console.error('ORCHESTRATOR_URL is not defined in environment variables')
    return { 
      success: false, 
      error: 'URL de l\'orchestrateur non configurée. Veuillez définir NEXT_PUBLIC_ORCHESTRATOR_URL.' 
    }
  }

  try {
    const baseUrl = ORCHESTRATOR_URL.endsWith('/') ? ORCHESTRATOR_URL.slice(0, -1) : ORCHESTRATOR_URL
    const fullUrl = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${ORCHESTRATOR_SECRET}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Orchestrator error (${response.status}): ${errorText}`)
      return { success: false, error: `Erreur Orchestrateur: ${response.statusText}` }
    }

    return await response.json()
  } catch (error: any) {
    console.error('Fetch error to orchestrator:', error)
    return { success: false, error: error.message || 'Erreur de connexion à l\'orchestrateur' }
  }
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

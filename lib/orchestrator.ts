const ORCHESTRATOR_URL = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://161.97.82.220:3000'
const ORCHESTRATOR_SECRET = (process.env.ORCHESTRATOR_SECRET || 'a3f8b2c1d9e4f7a6b5c8d1e9f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0').trim()
console.log('DEBUG - Orchestrator URL:', ORCHESTRATOR_URL)
console.log('DEBUG - Secret prefix:', ORCHESTRATOR_SECRET.substring(0, 5))

async function orchestratorFetch(path: string, options: RequestInit = {}) {
  let fullUrl = ''
  if (!ORCHESTRATOR_URL) {
    console.error('ORCHESTRATOR_URL is not defined in environment variables')
    return { 
      success: false, 
      error: 'URL de l\'orchestrateur non configurée. Veuillez définir NEXT_PUBLIC_ORCHESTRATOR_URL.' 
    }
  }

  try {
    const baseUrl = ORCHESTRATOR_URL.endsWith('/') ? ORCHESTRATOR_URL.slice(0, -1) : ORCHESTRATOR_URL
    fullUrl = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`
    
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
      let errorData: any = null
      try {
        const text = await response.text()
        try {
          errorData = JSON.parse(text)
        } catch (e) {
          errorData = { error: text }
        }
      } catch (e) {}
      
      const errorMessage = errorData?.error || response.statusText
      console.warn(`Orchestrator error (${response.status}) on ${path}:`, errorData || response.statusText)
      
      // Si on a des infos de debug (mismatch token), on les affiche dans la console serveur
      if (errorData?.debug) {
        console.error(`[Auth Debug] Received: ${errorData.debug.received} (Len: ${errorData.debug.received_length}), Expected: ${errorData.debug.expected} (Len: ${errorData.debug.expected_length})`)
      }

      return { 
        success: false, 
        error: `Erreur ${response.status}: ${errorMessage}` 
      }
    }

    return await response.json()
  } catch (error: any) {
    console.error('DEBUG - Full URL used:', fullUrl)
    console.error('DEBUG - Secret length:', ORCHESTRATOR_SECRET.length)
    // Ne pas log l'erreur complète si c'est juste une connexion refusée (orchestrateur éteint)
    if (error.code === 'ECONNREFUSED') {
      console.warn(`Orchestrator is offline at ${ORCHESTRATOR_URL}`)
    } else {
      console.error('Fetch error to orchestrator:', error)
    }
    return { success: false, error: 'Orchestrateur hors ligne' }
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

export async function restartInstance(id: string | number, type: string, deploy_commands: boolean = false) {
  return orchestratorFetch('/api/restart-bot', { 
    method: 'POST',
    body: JSON.stringify({ slot_id: id, type, deploy_commands })
  })
}

export async function stopInstance(id: string | number, type: string) {
  return orchestratorFetch('/api/stop-bot', { 
    method: 'POST',
    body: JSON.stringify({ slot_id: id, type })
  })
}

export async function deleteInstance(id: string | number, type: string) {
  return orchestratorFetch('/api/delete-bot', { 
    method: 'POST',
    body: JSON.stringify({ slot_id: id, type })
  })
}

export async function deleteInstanceByLicense(license_key: string) {
  return orchestratorFetch('/api/delete-by-license', {
    method: 'POST',
    body: JSON.stringify({ license_key })
  })
}

export async function launchInstance(license_key: string, token_encrypted: string, client_id: string) {
  return orchestratorFetch('/api/launch-bot', {
    method: 'POST',
    body: JSON.stringify({ license_key, token_encrypted, client_id })
  })
}

export async function getLogs(name: string, lines: number = 100) {
  return orchestratorFetch(`/api/logs/${name}?lines=${lines}`)
}

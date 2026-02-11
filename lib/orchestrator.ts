export async function getOrchestratorStatus() {
  const url = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3000';
  const secret = process.env.ORCHESTRATOR_SECRET;

  try {
    const response = await fetch(`${url}/api/status`, {
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Orchestrator error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch orchestrator status:', error);
    return null;
  }
}

export async function restartBots(type?: 'slotbot' | 'botgestion') {
  const url = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3000';
  const secret = process.env.ORCHESTRATOR_SECRET;

  try {
    const response = await fetch(`${url}/api/restart-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type })
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to restart bots:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function restartInstance(slot_id: number, type: 'slotbot' | 'botgestion' = 'slotbot') {
  const url = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3000';
  const secret = process.env.ORCHESTRATOR_SECRET;

  try {
    const response = await fetch(`${url}/api/restart-bot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ slot_id, type })
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to restart instance:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function stopInstance(slot_id: number, type: 'slotbot' | 'botgestion' = 'slotbot') {
  const url = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3000';
  const secret = process.env.ORCHESTRATOR_SECRET;

  try {
    const response = await fetch(`${url}/api/stop-bot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ slot_id, type })
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to stop instance:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteInstance(slot_id: number, type: 'slotbot' | 'botgestion' = 'slotbot') {
  const url = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3000';
  const secret = process.env.ORCHESTRATOR_SECRET;

  try {
    const response = await fetch(`${url}/api/delete-bot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ slot_id, type })
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to delete instance:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getLogs(name: string, lines: number = 100) {
  const url = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3000';
  const secret = process.env.ORCHESTRATOR_SECRET;

  try {
    const response = await fetch(`${url}/api/logs?name=${name}&lines=${lines}`, {
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function setMaintenanceMode(enabled: boolean) {
  const url = process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || 'http://localhost:3000';
  const secret = process.env.ORCHESTRATOR_SECRET;

  try {
    const response = await fetch(`${url}/api/maintenance-mode`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled })
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to set maintenance mode:', error);
    return { success: false, error: (error as Error).message };
  }
}

"use server"

import { getLogs, getOrchestratorStatus } from "@/lib/orchestrator"

export async function fetchBotListAction() {
  const status = await getOrchestratorStatus()
  if (!status || !status.success) return []
  return status.bots || []
}

export async function fetchLogsAction(name: string, lines: number = 100) {
  return await getLogs(name, lines)
}

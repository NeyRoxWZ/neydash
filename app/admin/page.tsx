"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { OverviewChart } from "@/components/ui/overview-chart"
import { Button } from "@/components/ui/button"
import { Activity, Server, CreditCard, RefreshCw, Power, ShieldAlert } from "lucide-react"
import { getStatsAction, restartBotsAction, toggleMaintenanceAction } from "./actions"
import { toast } from "sonner"

export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRestarting, setIsRestarting] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const stats = await getStatsAction()
      setData(stats)
    } catch (err) {
      toast.error("Erreur lors de la récupération des stats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const handleRestart = async (type?: 'slotbot' | 'botgestion') => {
    const typeLabel = type || 'all'
    setIsRestarting(typeLabel)
    try {
      const res = await restartBotsAction(type)
      if (res.success) {
        toast.success(`Redémarrage lancé pour : ${typeLabel}`)
      } else {
        toast.error(`Erreur : ${res.error}`)
      }
    } catch (err) {
      toast.error("Erreur lors du redémarrage")
    } finally {
      setIsRestarting(null)
      fetchStats()
    }
  }

  const handleMaintenance = async (enabled: boolean) => {
    try {
      const res = await toggleMaintenanceAction(enabled)
      if (res.success) {
        toast.success(`Mode maintenance ${enabled ? 'activé' : 'désactivé'}`)
        fetchStats()
      } else {
        toast.error(`Erreur : ${res.error}`)
      }
    } catch (err) {
      toast.error("Erreur maintenance")
    }
  }

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    return `${d}j ${h}h`
  }

  const stats = data?.stats || {}
  const licenses = data?.licenses || { active: 0, expired: 0 }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#fafafa]">Dashboard</h2>
          <p className="text-[#a1a1aa]">Overview of your bot activity and performance.</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={fetchStats} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bots Online</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${stats.online_bots || 0}/${stats.total_bots || 0}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Slots used: {stats.total_bots || 0}/30
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RAM Usage</CardTitle>
            <Server className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${stats.memory_used_mb || 0} MB`}
            </div>
            <p className="text-xs text-muted-foreground">
              VPS Total: {stats.system_total_memory_gb || 0} GB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VPS Uptime</CardTitle>
            <Power className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : formatUptime(stats.uptime_seconds || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Load: {stats.load_avg?.[0].toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licenses</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : licenses.active} Active
            </div>
            <p className="text-xs text-[#ef4444]">
              {licenses.expired} Expired
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Activity across all instances in the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
            <CardDescription>Quick controls for your infrastructure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Button 
                variant="secondary" 
                className="w-full justify-start gap-2"
                onClick={() => handleRestart()}
                disabled={isRestarting !== null}
              >
                <RefreshCw className={`w-4 h-4 ${isRestarting === 'all' ? 'animate-spin' : ''}`} />
                Restart All Bots
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start gap-2"
                onClick={() => handleRestart('slotbot')}
                disabled={isRestarting !== null}
              >
                <RefreshCw className={`w-4 h-4 ${isRestarting === 'slotbot' ? 'animate-spin' : ''}`} />
                Restart SlotBot Only
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start gap-2"
                onClick={() => handleRestart('botgestion')}
                disabled={isRestarting !== null || !stats.bots_by_type?.botgestion}
              >
                <RefreshCw className={`w-4 h-4 ${isRestarting === 'botgestion' ? 'animate-spin' : ''}`} />
                Restart BotGestion Only
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between p-3 rounded-md bg-secondary/20 border border-border">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Redirect bots to maintenance</p>
                  </div>
                </div>
                <Button 
                  variant={data?.maintenance_mode === 'true' ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={() => handleMaintenance(data?.maintenance_mode !== 'true')}
                >
                  {data?.maintenance_mode === 'true' ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Bots by Type</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>SlotBot Instances</span>
                  <span className="font-mono">{stats.bots_by_type?.slotbot || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>BotGestion Instances</span>
                  <span className="font-mono">{stats.bots_by_type?.botgestion || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


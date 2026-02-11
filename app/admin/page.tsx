"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewChart } from "@/components/ui/overview-chart"
import { Button } from "@/components/ui/button"
import { Activity, Server, CreditCard, RefreshCw, Power, ShieldAlert } from "lucide-react"
import { getStatsAction, restartBotsAction, toggleMaintenanceAction } from "./actions"
import { toast } from "sonner"

export default function AdminPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRestarting, setIsRestarting] = useState<string | null>(null)
  const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(false)

  const fetchStats = async () => {
    try {
      const res = await getStatsAction()
      if (res && res.success) {
        setData(res)
      } else if (res && res.error) {
        toast.error("Erreur stats: " + res.error)
      }
    } catch (err) {
      toast.error("Erreur lors de la récupération des statistiques")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRestart = async (type: 'all' | 'slotbot' | 'botgestion' = 'all') => {
    setIsRestarting(type)
    try {
      const res = await restartBotsAction(type)
      if (res && res.success) {
        toast.success(`Redémarrage lancé pour : ${type === 'all' ? 'tous les bots' : type}`)
      } else {
        toast.error(`Erreur : ${res?.error || 'Inconnue'}`)
      }
    } catch (err) {
      toast.error("Erreur lors du redémarrage")
    } finally {
      setIsRestarting(null)
      fetchStats()
    }
  }

  const handleMaintenance = async (enabled: boolean) => {
    setIsMaintenanceLoading(true)
    try {
      const res = await toggleMaintenanceAction(enabled)
      if (res && res.success) {
        toast.success(`Mode maintenance ${enabled ? 'activé' : 'désactivé'}`)
        fetchStats()
      } else {
        toast.error(`Erreur : ${res?.error || 'Inconnue'}`)
      }
    } catch (err) {
      toast.error("Erreur lors du changement de mode maintenance")
    } finally {
      setIsMaintenanceLoading(false)
    }
  }

  const formatUptime = (seconds: number) => {
    if (!seconds) return "0j 0h"
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    return `${d}j ${h}h`
  }

  const stats = data?.stats || {}
  const licenses = data?.licenses || { active: 0, expired: 0 }
  const isMaintenance = data?.maintenance_mode === true || data?.maintenance_mode === 'true'

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#fafafa]">Tableau de Bord</h2>
          <p className="text-[#a1a1aa]">Aperçu de l'activité et des performances de vos bots.</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={fetchStats} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#fafafa]">Bots en Ligne</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#fafafa]">{data?.bots?.filter((b: any) => b.status === 'online').length || 0}</div>
            <p className="text-xs text-[#a1a1aa]">sur {data?.bots?.length || 0} instances totales</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#fafafa]">Utilisation CPU</CardTitle>
            <Server className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#fafafa]">{stats.cpu_usage || 0}%</div>
            <p className="text-xs text-[#a1a1aa]">Moyenne sur le cluster</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#fafafa]">Utilisation RAM</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#fafafa]">{Math.round((stats.memory_usage || 0) / 1024)} MB</div>
            <p className="text-xs text-[#a1a1aa]">Mémoire totale consommée</p>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#fafafa]">Licences Actives</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#fafafa]">{licenses.active || 0}</div>
            <p className="text-xs text-[#a1a1aa]">{licenses.expired || 0} licences expirées</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">Aperçu de l'Activité</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={data?.chartData || []} />
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader>
            <CardTitle className="text-[#fafafa]">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#a1a1aa]">Contrôle Global</label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start gap-2 border-white/[0.05] hover:bg-white/[0.05] text-[#fafafa]"
                  onClick={() => handleRestart('all')}
                  disabled={isRestarting !== null}
                >
                  <RefreshCw className={`w-4 h-4 ${isRestarting === 'all' ? 'animate-spin' : ''}`} />
                  Tout redémarrer
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start gap-2 border-white/[0.05] hover:bg-white/[0.05] text-[#fafafa]"
                  onClick={() => handleRestart('slotbot')}
                  disabled={isRestarting !== null}
                >
                  <RefreshCw className={`w-4 h-4 ${isRestarting === 'slotbot' ? 'animate-spin' : ''}`} />
                  Redémarrer Slots
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#a1a1aa]">Système</label>
              <Button 
                variant={isMaintenance ? "destructive" : "secondary"}
                className="justify-start gap-2"
                onClick={() => handleMaintenance(!isMaintenance)}
                disabled={isMaintenanceLoading}
              >
                {isMaintenanceLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                {isMaintenance ? "Désactiver Maintenance" : "Activer Maintenance"}
              </Button>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex gap-3">
                <Power className="w-5 h-5 text-yellow-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-500">Statut Système</p>
                  <p className="text-xs text-yellow-500/80">
                    {isMaintenance 
                      ? "Le système est actuellement en mode maintenance. Les bots ne répondent plus aux commandes."
                      : "Le système fonctionne normalement. Toutes les instances sont opérationnelles."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

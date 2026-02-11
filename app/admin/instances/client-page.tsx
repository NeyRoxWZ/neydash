"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  RefreshCw, 
  Play, 
  Square, 
  RotateCcw, 
  Trash2, 
  Search,
  Bot,
  Cpu,
  HardDrive,
  Activity,
  AlertCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  fetchInstancesAction, 
  restartInstanceAction, 
  stopInstanceAction,
  deleteInstanceAction
} from "./actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface BotInstance {
  name: string
  type: 'slotbot' | 'botgestion'
  slot_id: number
  pid?: number
  status: string
  uptime?: number
  memory: number
  cpu: number
  license_key?: string
  client_id?: string
}

export default function InstancesClientPage() {
  const [instances, setInstances] = useState<BotInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Modal states
  const [selectedBot, setSelectedBot] = useState<BotInstance | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null)

  const fetchInstances = async (showToast = false) => {
    setIsRefreshing(true)
    try {
      const res = await fetchInstancesAction()
      if (res.success) {
        setInstances(res.bots)
        if (showToast) toast.success("Instances mises à jour")
      } else {
        toast.error(res.error || "Erreur lors de la récupération")
      }
    } catch (err) {
      toast.error("Erreur de connexion à l'orchestrateur")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInstances()
    const interval = setInterval(() => fetchInstances(false), 15000)
    return () => clearInterval(interval)
  }, [])

  const handleAction = async (bot: BotInstance, action: 'restart' | 'stop' | 'delete') => {
    const actionId = `${action}-${bot.slot_id}`
    setIsActionLoading(actionId)
    
    try {
      let res;
      if (action === 'restart') res = await restartInstanceAction(bot.slot_id, bot.type)
      else if (action === 'stop') res = await stopInstanceAction(bot.slot_id, bot.type)
      else if (action === 'delete') res = await deleteInstanceAction(bot.slot_id, bot.type)
      
      if (res.success) {
        toast.success(`Action ${action} réussie pour le slot ${bot.slot_id}`)
        fetchInstances()
      } else {
        toast.error(`Erreur: ${res.error}`)
      }
    } catch (err) {
      toast.error(`Erreur lors de l'action ${action}`)
    } finally {
      setIsActionLoading(null)
      if (action === 'delete') setIsDeleteModalOpen(false)
    }
  }

  const filteredInstances = instances.filter(bot => 
    bot.name.toLowerCase().includes(search.toLowerCase()) ||
    bot.slot_id.toString().includes(search) ||
    bot.license_key?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'stopped': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'launching':
      case 'restarting': return 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse'
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const formatUptime = (ms?: number) => {
    if (!ms) return '0s'
    const seconds = Math.floor((Date.now() - ms) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instances PM2</h1>
          <p className="text-muted-foreground">Gérez vos bots actifs en temps réel.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchInstances(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par slot, nom ou licence..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border">
          <Bot className="w-3 h-3" />
          <span>{instances.length} bots détectés</span>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.05] bg-[#0A0A0A] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/[0.05]">
              <TableHead className="w-[100px]">Slot</TableHead>
              <TableHead>Process Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CPU / RAM</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Chargement des instances...
                </TableCell>
              </TableRow>
            ) : filteredInstances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Aucune instance trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filteredInstances.map((bot) => (
                <TableRow key={`${bot.type}-${bot.slot_id}`} className="hover:bg-white/[0.02] border-white/[0.05]">
                  <TableCell className="font-mono font-bold text-blue-500">
                    #{bot.slot_id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{bot.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {bot.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(bot.status)}`}>
                      {bot.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Cpu className="w-3 h-3 text-muted-foreground" />
                        <span>{bot.cpu}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <HardDrive className="w-3 h-3 text-muted-foreground" />
                        <span>{formatMemory(bot.memory)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3 text-muted-foreground" />
                      {bot.status === 'online' ? formatUptime(bot.uptime) : '---'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-500"
                        title="Redémarrer"
                        disabled={isActionLoading === `restart-${bot.slot_id}`}
                        onClick={() => handleAction(bot, 'restart')}
                      >
                        <RotateCcw className={`w-4 h-4 ${isActionLoading === `restart-${bot.slot_id}` ? 'animate-spin' : ''}`} />
                      </Button>
                      
                      {bot.status === 'online' ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-yellow-500/10 hover:text-yellow-500"
                          title="Arrêter"
                          disabled={isActionLoading === `stop-${bot.slot_id}`}
                          onClick={() => handleAction(bot, 'stop')}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-green-500/10 hover:text-green-500"
                          title="Démarrer"
                          disabled={isActionLoading === `restart-${bot.slot_id}`}
                          onClick={() => handleAction(bot, 'restart')}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                        title="Supprimer (PM2 & DB)"
                        onClick={() => {
                          setSelectedBot(bot)
                          setIsDeleteModalOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/[0.05]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              Supprimer l'instance ?
            </DialogTitle>
            <DialogDescription>
              Cette action va arrêter le bot #{selectedBot?.slot_id}, le supprimer de PM2 et **supprimer sa base de données locale**.
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedBot && handleAction(selectedBot, 'delete')}
              disabled={isActionLoading === `delete-${selectedBot?.slot_id}`}
            >
              {isActionLoading === `delete-${selectedBot?.slot_id}` ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Confirmer la suppression
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

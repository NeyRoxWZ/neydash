"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  RefreshCw, 
  Terminal, 
  Search,
  Bot,
  Trash2,
  Settings,
  AlertCircle,
  Clock,
  ChevronDown
} from "lucide-react"
import { toast } from "sonner"
import { fetchBotListAction, fetchLogsAction } from "./actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BotItem {
  name: string
  slot_id: number
  type: string
}

export default function LogsClientPage() {
  const [bots, setBots] = useState<BotItem[]>([])
  const [selectedBot, setSelectedBot] = useState<string>("")
  const [logs, setLogs] = useState<{out: string, err: string}>({ out: "", err: "" })
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [logType, setLogType] = useState<'out' | 'err'>('out')
  const logContainerRef = useRef<HTMLPreElement>(null)

  const fetchBots = async () => {
    const list = await fetchBotListAction()
    setBots(list)
    if (list.length > 0 && !selectedBot) {
      setSelectedBot(list[0].name)
    }
  }

  const fetchLogs = async (showToast = false) => {
    if (!selectedBot) return
    setLoading(true)
    try {
      const res = await fetchLogsAction(selectedBot, 200)
      if (res.success) {
        setLogs(res.logs)
        if (showToast) toast.success("Logs mis à jour")
      } else {
        toast.error("Erreur logs: " + res.error)
      }
    } catch (err) {
      toast.error("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBots()
  }, [])

  useEffect(() => {
    if (selectedBot) {
      fetchLogs()
    }
  }, [selectedBot])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh && selectedBot) {
      interval = setInterval(() => fetchLogs(false), 5000)
    }
    return () => clearInterval(interval)
  }, [autoRefresh, selectedBot])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs, logType])

  const clearLogs = () => {
    setLogs({ out: "", err: "" })
    toast.success("Affichage vidé (côté client)")
  }

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs Temps Réel</h1>
          <p className="text-muted-foreground">Visualisez les logs PM2 de vos instances.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={autoRefresh ? "default" : "outline"} 
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Clock className="w-4 h-4 mr-2" />
            {autoRefresh ? "Auto-refresh: ON" : "Auto-refresh: OFF"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchLogs(true)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[250px] justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-500" />
                <span>{selectedBot || "Sélectionner un bot"}</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[250px] bg-[#0A0A0A] border-white/[0.05]">
            {bots.map((bot) => (
              <DropdownMenuItem 
                key={bot.name}
                onClick={() => setSelectedBot(bot.name)}
                className="cursor-pointer"
              >
                <span className="font-mono text-xs text-blue-500 mr-2">#{bot.slot_id}</span>
                {bot.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex p-1 bg-muted/30 rounded-lg border border-white/[0.05]">
          <Button 
            variant={logType === 'out' ? 'secondary' : 'ghost'} 
            size="sm"
            className="h-8 text-xs px-4"
            onClick={() => setLogType('out')}
          >
            Output (STDOUT)
          </Button>
          <Button 
            variant={logType === 'err' ? 'secondary' : 'ghost'} 
            size="sm"
            className={`h-8 text-xs px-4 ${logType === 'err' ? 'text-red-500' : ''}`}
            onClick={() => setLogType('err')}
          >
            Errors (STDERR)
          </Button>
        </div>

        <Button variant="ghost" size="icon" onClick={clearLogs} title="Vider l'écran">
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 rounded-xl border border-white/[0.05] bg-[#050505] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-b border-white/[0.05] shrink-0">
          <Terminal className="w-4 h-4 text-green-500" />
          <span className="text-xs font-mono text-muted-foreground">terminal — {selectedBot} — {logType === 'out' ? 'out.log' : 'err.log'}</span>
        </div>
        
        <pre 
          ref={logContainerRef}
          className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-white/10"
        >
          {loading && logs[logType] === "" ? (
            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Initialisation du flux de logs...
            </div>
          ) : logs[logType] ? (
            <code className={logType === 'err' ? "text-red-400" : "text-green-400/90"}>
              {logs[logType]}
            </code>
          ) : (
            <span className="text-muted-foreground italic">Aucun log disponible pour cette instance.</span>
          )}
        </pre>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Stream Active
        </div>
        <div>•</div>
        <div>Buffer: 200 lines</div>
        <div>•</div>
        <div>Poll Interval: 5s</div>
      </div>
    </div>
  )
}

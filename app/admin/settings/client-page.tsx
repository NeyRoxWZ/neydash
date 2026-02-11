"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Save, 
  ShieldAlert, 
  Link, 
  Github, 
  Server,
  RefreshCw,
  Info,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { fetchSettingsAction, updateSettingAction } from "./actions"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SettingsClientPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [settings, setSettings] = useState<any>({
    maintenance_mode: 'false',
    support_link: '',
    bot_version: '1.0.0',
    orchestrator_version: '1.0.0'
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetchSettingsAction()
      if (res.success) {
        setSettings((prev: any) => ({ ...prev, ...res.settings }))
      }
    } catch (err) {
      toast.error("Erreur de chargement des paramètres")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (key: string, value: string) => {
    setSaving(key)
    try {
      const res = await updateSettingAction(key, value)
      if (res.success) {
        setSettings((prev: any) => ({ ...prev, [key]: value }))
        toast.success("Paramètre mis à jour")
      } else {
        toast.error("Erreur: " + res.error)
      }
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">Gérez les paramètres globaux de l'écosystème.</p>
      </div>

      <div className="grid gap-6">
        {/* Maintenance Card */}
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader>
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <ShieldAlert className="w-5 h-5" />
              <CardTitle>Mode Maintenance</CardTitle>
            </div>
            <CardDescription>
              Une fois activé, tous les bots refuseront les nouvelles commandes et afficheront un message de maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Statut du mode maintenance</Label>
              <p className="text-sm text-muted-foreground">
                {settings.maintenance_mode === 'true' ? 'Activé — Les bots sont en pause' : 'Désactivé — Les bots fonctionnent normalement'}
              </p>
            </div>
            <Switch 
              checked={settings.maintenance_mode === 'true'}
              onCheckedChange={(checked) => handleUpdate('maintenance_mode', checked.toString())}
              disabled={saving === 'maintenance_mode'}
            />
          </CardContent>
        </Card>

        {/* Support Link Card */}
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Link className="w-5 h-5" />
              <CardTitle>Support & Communauté</CardTitle>
            </div>
            <CardDescription>
              Le lien Discord affiché par les bots via la commande /support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="support_link">URL du serveur Discord</Label>
              <div className="flex gap-2">
                <Input 
                  id="support_link"
                  placeholder="https://discord.gg/..."
                  value={settings.support_link}
                  onChange={(e) => setSettings({ ...settings, support_link: e.target.value })}
                  className="bg-white/[0.02] border-white/[0.05]"
                />
                <Button 
                  onClick={() => handleUpdate('support_link', settings.support_link)}
                  disabled={saving === 'support_link'}
                >
                  {saving === 'support_link' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-white/[0.01] border-t border-white/[0.05] py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              Ce lien est synchronisé en temps réel avec tous les bots actifs.
            </div>
          </CardFooter>
        </Card>

        {/* Versions Card */}
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader>
            <div className="flex items-center gap-2 text-purple-500 mb-1">
              <Server className="w-5 h-5" />
              <CardTitle>Versions Système</CardTitle>
            </div>
            <CardDescription>
              Informations sur les versions actuelles déployées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="text-xs text-muted-foreground uppercase mb-1">SlotBot Version</div>
                <div className="text-xl font-mono font-bold">{settings.bot_version || '1.0.0'}</div>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="text-xs text-muted-foreground uppercase mb-1">Orchestrator</div>
                <div className="text-xl font-mono font-bold text-green-500">{settings.orchestrator_version || '1.0.0'}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t border-white/[0.05] py-4">
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <a href="https://github.com/neybot" target="_blank" rel="noreferrer">
                <Github className="w-3 h-3 mr-2" />
                Dépôt Source
              </a>
            </Button>
            <div className="text-[10px] text-muted-foreground font-mono">
              Build: 20260211.4
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

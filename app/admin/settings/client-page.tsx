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
    dashboard_logo_url: '',
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
      if (res && res.success) {
        setSettings((prev: any) => ({ ...prev, ...res.settings }))
      } else if (res && res.error) {
        toast.error("Erreur de chargement: " + res.error)
      }
    } catch (err) {
      toast.error("Erreur de connexion aux paramètres")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (key: string, value: string) => {
    setSaving(key)
    try {
      const res = await updateSettingAction(key, value)
      if (res && res.success) {
        setSettings((prev: any) => ({ ...prev, [key]: value }))
        toast.success("Paramètre enregistré avec succès")
      } else {
        toast.error("Erreur lors de l'enregistrement: " + (res?.error || "Inconnue"))
      }
    } catch (err) {
      toast.error("Erreur réseau lors de la sauvegarde")
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
        <h1 className="text-3xl font-bold tracking-tight text-[#fafafa]">Configuration</h1>
        <p className="text-[#a1a1aa]">Gérez les paramètres globaux de l'écosystème.</p>
      </div>

      <div className="grid gap-6">
        {/* Maintenance Card */}
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader>
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <ShieldAlert className="w-5 h-5" />
              <CardTitle>Mode Maintenance</CardTitle>
            </div>
            <CardDescription className="text-[#a1a1aa]">
              Une fois activé, tous les bots refuseront les nouvelles commandes et afficheront un message de maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[#fafafa]">Statut du Système</Label>
              <p className="text-xs text-[#a1a1aa]">
                Actuellement: {settings.maintenance_mode === 'true' ? 'En maintenance' : 'Opérationnel'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {saving === 'maintenance_mode' && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
              <Switch 
                checked={settings.maintenance_mode === 'true'}
                onCheckedChange={(checked) => handleUpdate('maintenance_mode', checked ? 'true' : 'false')}
                disabled={saving === 'maintenance_mode'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Liens et URLs */}
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Link className="w-5 h-5" />
              <CardTitle>Liens & Apparence</CardTitle>
            </div>
            <CardDescription className="text-[#a1a1aa]">
              Configurez les liens publics et l'apparence du dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="support_link" className="text-[#fafafa]">Lien du Support (Discord)</Label>
              <div className="flex gap-2">
                <Input 
                  id="support_link"
                  placeholder="https://discord.gg/..."
                  value={settings.support_link || ''}
                  onChange={(e) => setSettings({ ...settings, support_link: e.target.value })}
                  className="bg-black/50 border-white/[0.05] text-[#fafafa]"
                />
                <Button 
                  size="icon" 
                  onClick={() => handleUpdate('support_link', settings.support_link)}
                  disabled={saving === 'support_link'}
                >
                  {saving === 'support_link' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboard_logo_url" className="text-[#fafafa]">URL du Logo du Dashboard</Label>
              <div className="flex gap-2">
                <Input 
                  id="dashboard_logo_url"
                  placeholder="https://.../logo.png"
                  value={settings.dashboard_logo_url || ''}
                  onChange={(e) => setSettings({ ...settings, dashboard_logo_url: e.target.value })}
                  className="bg-black/50 border-white/[0.05] text-[#fafafa]"
                />
                <Button 
                  size="icon" 
                  onClick={() => handleUpdate('dashboard_logo_url', settings.dashboard_logo_url)}
                  disabled={saving === 'dashboard_logo_url'}
                >
                  {saving === 'dashboard_logo_url' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-[#a1a1aa] italic">
                L'image s'affiche dans la barre latérale (format recommandé : carré, 128x128).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-[#0A0A0A] border-white/[0.05]">
          <CardHeader>
            <div className="flex items-center gap-2 text-purple-500 mb-1">
              <Info className="w-5 h-5" />
              <CardTitle>Informations Système</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <p className="text-xs text-[#a1a1aa] uppercase tracking-wider mb-1">Version du Bot</p>
              <p className="text-lg font-mono text-[#fafafa]">{settings.bot_version || '1.0.0'}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <p className="text-xs text-[#a1a1aa] uppercase tracking-wider mb-1">Version Orchestrateur</p>
              <p className="text-lg font-mono text-[#fafafa]">{settings.orchestrator_version || '1.0.0'}</p>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t border-white/[0.05] py-4">
            <Button variant="ghost" size="sm" className="text-xs text-[#a1a1aa] hover:text-[#fafafa]" asChild>
              <a href="https://github.com/neybot" target="_blank" rel="noreferrer">
                <Github className="w-3 h-3 mr-2" />
                Dépôt Source
              </a>
            </Button>
            <div className="flex items-center text-[10px] text-[#a1a1aa]">
              Dernière synchronisation: {new Date().toLocaleTimeString()}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

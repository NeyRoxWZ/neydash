"use client"

import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import DoubleClickReveal from "@/components/DoubleClickReveal"
import { 
  createLicenseAction, 
  deleteLicenseAction, 
  updateLicenseAction 
} from "./actions"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Calendar, Clock, User, Key, Check, X, Copy } from "lucide-react"

interface License {
  id: string
  license_key: string
  status: string
  client_id: string | null
  expiresat: string | null
  created_at: string
}

export default function LicensesClientPage({ initialLicenses }: { initialLicenses: License[] }) {
  const [licenses, setLicenses] = useState<License[]>(initialLicenses)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  
  // Create Modal State
  const [duration, setDuration] = useState<number | string>(30)
  const [customMinutes, setCustomMinutes] = useState("")
  const [newLicenseKey, setNewLicenseKey] = useState<string | null>(null)

  // Edit Modal State
  const [editExpiresAt, setEditExpiresAt] = useState("")

  const handleCreateLicense = async () => {
    try {
      const finalDuration = duration === 'custom' ? customMinutes : duration
      const newLicense = await createLicenseAction(finalDuration)
      setLicenses([newLicense, ...licenses])
      setNewLicenseKey(newLicense.license_key)
      toast.success("Licence créée avec succès")
    } catch (err) {
      toast.error("Erreur lors de la création")
    }
  }

  const handleUpdateLicense = async () => {
    if (!selectedLicense) return
    try {
      await updateLicenseAction(selectedLicense.license_key, new Date(editExpiresAt).toISOString())
      setLicenses(licenses.map(l => 
        l.license_key === selectedLicense.license_key 
          ? { ...l, expiresat: new Date(editExpiresAt).toISOString() } 
          : l
      ))
      setIsEditModalOpen(false)
      toast.success("Licence mise à jour")
    } catch (err) {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleDeleteLicense = async () => {
    if (!selectedLicense) return
    try {
      await deleteLicenseAction(selectedLicense.license_key)
      setLicenses(licenses.filter(l => l.license_key !== selectedLicense.license_key))
      setIsDeleteModalOpen(false)
      toast.success("Licence supprimée")
    } catch (err) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'expired': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#fafafa]">Licenses</h2>
          <p className="text-[#a1a1aa]">Manage and monitor your product licenses.</p>
        </div>
        <Button onClick={() => {
          setNewLicenseKey(null)
          setIsCreateModalOpen(true)
        }} className="gap-2">
          <Plus className="w-4 h-4" />
          Générer Licence
        </Button>
      </div>

      <div className="rounded-md border border-[#27272a] bg-[#09090b]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clé</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.map((license) => (
              <TableRow key={license.id}>
                <TableCell className="w-[280px]">
                  <DoubleClickReveal 
                    value={license.license_key} 
                    label="Licence"
                    masked={license.license_key.substring(0, 4) + "****" + license.license_key.substring(license.license_key.length - 4)}
                  />
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(license.status)}`}>
                    {license.status}
                  </span>
                </TableCell>
                <TableCell className="w-[200px]">
                  {license.client_id ? (
                    <DoubleClickReveal 
                      value={license.client_id} 
                      label="Client ID"
                      masked={license.client_id.substring(0, 4) + "****"}
                    />
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Non activée</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {license.expiresat ? new Date(license.expiresat).toLocaleDateString() : 'Jamais'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setSelectedLicense(license)
                        setEditExpiresAt(license.expiresat ? new Date(license.expiresat).toISOString().slice(0, 16) : "")
                        setIsEditModalOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        setSelectedLicense(license)
                        setIsDeleteModalOpen(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Générer une nouvelle licence"
        description="Choisissez la durée de validité de la licence."
      >
        {!newLicenseKey ? (
          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Durée</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '7 Jours', value: 7 },
                  { label: '14 Jours', value: 14 },
                  { label: '30 Jours', value: 30 },
                  { label: 'Custom', value: 'custom' }
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    variant={duration === opt.value ? 'default' : 'secondary'}
                    onClick={() => setDuration(opt.value)}
                    className="w-full"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {duration === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Minutes personnalisées</label>
                <Input 
                  type="number" 
                  placeholder="Ex: 600 (10h)" 
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
              <Button onClick={handleCreateLicense}>Générer</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h4 className="font-bold">Licence générée !</h4>
                <p className="text-sm text-muted-foreground">Copiez la clé ci-dessous :</p>
              </div>
            </div>

            <div className="bg-secondary/20 p-4 rounded-md border border-border flex items-center justify-between">
              <code className="text-lg font-mono font-bold">{newLicenseKey}</code>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  navigator.clipboard.writeText(newLicenseKey)
                  toast.success("Clé copiée !")
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <Button className="w-full" onClick={() => setIsCreateModalOpen(false)}>Terminer</Button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'expiration"
        description={`Licence : ${selectedLicense?.license_key}`}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nouvelle date d'expiration</label>
            <Input 
              type="datetime-local" 
              value={editExpiresAt}
              onChange={(e) => setEditExpiresAt(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateLicense}>Sauvegarder</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer la licence ?"
        description="Cette action est irréversible. Le bot associé s'arrêtera immédiatement."
      >
        <div className="flex flex-col gap-6 pt-4">
          <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            Attention : Supprimer une licence active déconnectera le bot du client.
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
            <Button variant="danger" className="bg-red-500 text-white hover:bg-red-600" onClick={handleDeleteLicense}>
              OUI, SUPPRIMER
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

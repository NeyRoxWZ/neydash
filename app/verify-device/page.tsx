'use client'

import { sendOtp, verifyOtp } from './actions'
import { useState } from 'react'

export default function VerifyDevicePage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    const res = await sendOtp()
    if (res?.error) {
      setError(res.error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <div className="flex flex-col gap-4 p-4 border rounded-md">
        <h1 className="text-2xl font-bold">Vérification du nouvel appareil</h1>
        <p className="text-sm text-gray-500">
          Cet appareil n'est pas reconnu. Veuillez vérifier votre identité.
        </p>

        {!sent ? (
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          >
            Envoyer le code de vérification
          </button>
        ) : (
          <form 
            action={async (formData) => {
              const res = await verifyOtp(formData)
              if (res?.error) {
                setError(res.error)
              }
            }} 
            className="flex flex-col gap-4"
          >
          <div className="flex flex-col gap-2">
            <label htmlFor="code">Code Secret Admin</label>
            <input
              name="code"
              type="password"
              placeholder="Entrez le code secret..."
              className="border rounded px-4 py-2 bg-[#09090b] text-white border-[#27272a]"
              required
            />
          </div>
            <button
              type="submit"
              className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
            >
              Vérifier
            </button>
          </form>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}

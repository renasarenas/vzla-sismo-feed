'use client'

import { useEffect, useState } from 'react'

export function OfflineBanner() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (online) return null

  return (
    <div className="fixed top-0 inset-x-0 z-[1200] bg-crisis-red text-white px-4 py-2 text-center">
      <p className="font-mono text-[11px] uppercase tracking-widest">
        Sin conexión a internet. Estás viendo el contenido guardado en el dispositivo.
      </p>
    </div>
  )
}

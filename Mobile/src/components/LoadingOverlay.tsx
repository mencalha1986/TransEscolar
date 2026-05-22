import { useState, useEffect } from "react"
import { useIsFetching, useIsMutating } from "@tanstack/react-query"

function BusIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="14" width="52" height="32" rx="6" fill="white" fillOpacity="0.95" />
      <rect x="6" y="14" width="52" height="8" rx="6" fill="#DBEAFE" />
      <rect x="6" y="18" width="52" height="4" fill="#DBEAFE" />
      <rect x="12" y="18" width="10" height="9" rx="2" fill="#3B82F6" />
      <rect x="27" y="18" width="10" height="9" rx="2" fill="#3B82F6" />
      <rect x="42" y="18" width="10" height="9" rx="2" fill="#3B82F6" />
      <rect x="42" y="30" width="10" height="12" rx="2" fill="#BFDBFE" />
      <rect x="46.5" y="30" width="1" height="12" fill="#93C5FD" />
      <rect x="4" y="36" width="4" height="6" rx="2" fill="white" fillOpacity="0.6" />
      <rect x="56" y="36" width="4" height="6" rx="2" fill="white" fillOpacity="0.6" />
      <rect x="6" y="28" width="5" height="4" rx="1" fill="#FEF08A" />
      <rect x="53" y="28" width="5" height="4" rx="1" fill="#FCA5A5" />
      <rect x="8" y="44" width="48" height="4" rx="2" fill="#1E40AF" fillOpacity="0.3" />
      <circle cx="18" cy="48" r="6" fill="#1E3A8A" />
      <circle cx="18" cy="48" r="3" fill="#60A5FA" />
      <circle cx="18" cy="48" r="1.2" fill="#DBEAFE" />
      <circle cx="46" cy="48" r="6" fill="#1E3A8A" />
      <circle cx="46" cy="48" r="3" fill="#60A5FA" />
      <circle cx="46" cy="48" r="1.2" fill="#DBEAFE" />
      <rect x="6" y="32" width="52" height="1" fill="#DBEAFE" fillOpacity="0.4" />
    </svg>
  )
}

function LoadingDots() {
  return (
    <div className="flex gap-2 items-center justify-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="block w-2 h-2 rounded-full bg-white"
          style={{ animation: `splash-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

export function LoadingOverlay() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const isLoading = isFetching > 0 || isMutating > 0

  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>
    let hideTimer: ReturnType<typeof setTimeout>

    if (isLoading) {
      // só exibe se demorar mais de 300 ms — evita flash em requisições rápidas
      showTimer = setTimeout(() => {
        setLeaving(false)
        setVisible(true)
      }, 300)
    } else if (visible) {
      setLeaving(true)
      hideTimer = setTimeout(() => {
        setVisible(false)
        setLeaving(false)
      }, 350)
    }

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div
      className={leaving ? "loading-overlay-out" : "loading-overlay-in"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="relative flex items-center justify-center mb-6">
        <div
          className="splash-ring absolute rounded-full border-2 border-white"
          style={{ width: 100, height: 100 }}
        />
        <div
          className="splash-ring absolute rounded-full border border-white"
          style={{ width: 100, height: 100, animationDelay: "0.7s" }}
        />
        <div
          className="loading-logo relative flex items-center justify-center rounded-full"
          style={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            boxShadow: "0 12px 40px rgba(37,99,235,0.5), 0 0 0 2px rgba(255,255,255,0.15)",
          }}
        >
          <div style={{ width: 56, height: 56 }}>
            <BusIcon />
          </div>
        </div>
      </div>

      <LoadingDots />
    </div>
  )
}

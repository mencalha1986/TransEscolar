import { useEffect, useState } from "react"

interface Props {
  onFinish: () => void
}

function BusIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Body */}
      <rect x="6" y="14" width="52" height="32" rx="6" fill="white" fillOpacity="0.95" />
      {/* Roof stripe */}
      <rect x="6" y="14" width="52" height="8" rx="6" fill="#DBEAFE" />
      <rect x="6" y="18" width="52" height="4" fill="#DBEAFE" />
      {/* Windows */}
      <rect x="12" y="18" width="10" height="9" rx="2" fill="#3B82F6" />
      <rect x="27" y="18" width="10" height="9" rx="2" fill="#3B82F6" />
      <rect x="42" y="18" width="10" height="9" rx="2" fill="#3B82F6" />
      {/* Door */}
      <rect x="42" y="30" width="10" height="12" rx="2" fill="#BFDBFE" />
      <rect x="46.5" y="30" width="1" height="12" fill="#93C5FD" />
      {/* Bumper front */}
      <rect x="4" y="36" width="4" height="6" rx="2" fill="white" fillOpacity="0.6" />
      {/* Bumper back */}
      <rect x="56" y="36" width="4" height="6" rx="2" fill="white" fillOpacity="0.6" />
      {/* Headlights */}
      <rect x="6" y="28" width="5" height="4" rx="1" fill="#FEF08A" />
      {/* Tail lights */}
      <rect x="53" y="28" width="5" height="4" rx="1" fill="#FCA5A5" />
      {/* Underbody */}
      <rect x="8" y="44" width="48" height="4" rx="2" fill="#1E40AF" fillOpacity="0.3" />
      {/* Wheels */}
      <circle cx="18" cy="48" r="6" fill="#1E3A8A" />
      <circle cx="18" cy="48" r="3" fill="#60A5FA" />
      <circle cx="18" cy="48" r="1.2" fill="#DBEAFE" />
      <circle cx="46" cy="48" r="6" fill="#1E3A8A" />
      <circle cx="46" cy="48" r="3" fill="#60A5FA" />
      <circle cx="46" cy="48" r="1.2" fill="#DBEAFE" />
      {/* Center line */}
      <rect x="6" y="32" width="52" height="1" fill="#DBEAFE" fillOpacity="0.4" />
    </svg>
  )
}

function LoadingDots() {
  return (
    <div className="splash-dots flex gap-2 items-center justify-center">
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

export function SplashScreen({ onFinish }: Props) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const exitTimer = setTimeout(() => setLeaving(true), 2600)
    const doneTimer = setTimeout(() => onFinish(), 3100)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(doneTimer)
    }
  }, [onFinish])

  return (
    <div
      className={leaving ? "splash-fadeout" : ""}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Ring pulse behind logo */}
      <div className="relative flex items-center justify-center mb-8">
        <div
          className="splash-ring absolute rounded-full border-2 border-white"
          style={{ width: 140, height: 140 }}
        />
        <div
          className="splash-ring absolute rounded-full border border-white"
          style={{ width: 140, height: 140, animationDelay: "0.7s" }}
        />

        {/* Logo circle */}
        <div
          className="splash-logo relative flex items-center justify-center rounded-full"
          style={{
            width: 120,
            height: 120,
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            boxShadow: "0 20px 60px rgba(37,99,235,0.5), 0 0 0 2px rgba(255,255,255,0.15)",
          }}
        >
          <div style={{ width: 80, height: 80 }}>
            <BusIcon />
          </div>
        </div>
      </div>

      {/* Company name */}
      <div className="splash-title text-center mb-2 px-6">
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
            textShadow: "0 2px 16px rgba(0,0,0,0.3)",
          }}
        >
          Trans<span style={{ color: "#93C5FD" }}>Escolar</span>
        </h1>
      </div>

      {/* Tagline */}
      <p
        className="splash-subtitle text-center px-8"
        style={{
          color: "rgba(255,255,255,0.65)",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "0.3px",
          marginBottom: 48,
        }}
      >
        Gestão inteligente de transporte escolar
      </p>

      {/* Loading dots */}
      <LoadingDots />
    </div>
  )
}

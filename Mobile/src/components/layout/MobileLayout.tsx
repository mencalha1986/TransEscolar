import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Bus, FileText, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Alunos", icon: Users, path: "/alunos" },
    { label: "Viagens", icon: Bus, path: "/transportes" },
    { label: "Contas", icon: FileText, path: "/mensalidades" },
    { label: "Mais", icon: Menu, path: "/perfil" },
  ]

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          🚐 TransEscolar
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 pb-safe-area-inset-bottom flex justify-around items-center h-16 shadow-lg z-20">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg transition-colors",
                isActive ? "text-primary font-semibold" : "text-slate-500"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

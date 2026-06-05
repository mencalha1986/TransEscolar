import { Outlet, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard, Users, Bus, CircleDollarSign, MoreHorizontal,
  BarChart3, Building2, ClipboardList, Receipt, UserCircle, ArrowLeft,
  MapPin, CalendarX, MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useRecadosNotificacao } from "@/hooks/useRecadosNotificacao"

const transportadorTabs = [
  { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Alunos", icon: Users, path: "/alunos" },
  { label: "Viagens", icon: Bus, path: "/transportes" },
  { label: "Financeiro", icon: CircleDollarSign, path: "/mensalidades" },
  { label: "Mais", icon: MoreHorizontal, path: "/mais" },
]

const superAdminTabs = [
  { label: "Início", icon: BarChart3, path: "/backoffice" },
  { label: "Clientes", icon: Building2, path: "/backoffice/transportadores" },
  { label: "Planos", icon: ClipboardList, path: "/backoffice/planos" },
  { label: "Assinaturas", icon: Receipt, path: "/backoffice/assinaturas" },
  { label: "Perfil", icon: UserCircle, path: "/perfil" },
]

const responsavelTabs = [
  { label: "Home", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Acompanhar", icon: MapPin, path: "/transportes" },
  { label: "Ausências", icon: CalendarX, path: "/ausencias" },
  { label: "Mensagens", icon: MessageSquare, path: "/mural" },
  { label: "Mais", icon: MoreHorizontal, path: "/mais-responsavel" },
]

const maisRoutes = [
  "/mais", "/escolas", "/mural", "/perfil", "/perfil/alterar-senha",
  "/mais-responsavel", "/meus-filhos", "/mensalidades/responsavel", "/historico", "/contato-transportador",
]

export function MobileLayout() {
  useRecadosNotificacao()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isImpersonating, voltarParaBackoffice } = useAuth()

  const isSuperAdmin = user?.perfil === "SuperAdmin"
  const isResponsavel = user?.perfil === "Responsavel"
  const tabs = isSuperAdmin ? superAdminTabs : isResponsavel ? responsavelTabs : transportadorTabs

  function isTabActive(tabPath: string): boolean {
    if (tabPath === "/mais" || tabPath === "/mais-responsavel") {
      return maisRoutes.some(r => location.pathname === r || location.pathname.startsWith(r + "/"))
    }
    if (tabPath === "/backoffice") {
      return location.pathname === "/backoffice"
    }
    return location.pathname.startsWith(tabPath)
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          🚐 TransEscolar
        </h1>
      </header>

      {/* Impersonation banner */}
      {isImpersonating && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between sticky top-[53px] z-10">
          <span className="text-sm text-amber-800 font-medium">
            Acessando como: <strong>{user?.nome}</strong>
          </span>
          <button
            onClick={voltarParaBackoffice}
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full active:opacity-70"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 pb-safe-area-inset-bottom flex justify-around items-center h-16 shadow-lg z-20">
        {tabs.map((item) => {
          const active = isTabActive(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg transition-colors",
                active ? "text-primary font-semibold" : "text-slate-500"
              )}
            >
              <item.icon className={cn("h-6 w-6", active && "fill-primary/10")} />
              <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

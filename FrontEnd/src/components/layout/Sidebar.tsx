import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard, GraduationCap, School, Bus, CreditCard,
  Building2, ClipboardList, Receipt, BarChart3, LogOut, ArrowLeft, X, MessageSquare
} from "lucide-react"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/alunos", label: "Alunos", icon: GraduationCap },
  { to: "/escolas", label: "Escolas", icon: School },
  { to: "/transportes", label: "Transportes", icon: Bus },
  { to: "/mensalidades", label: "Mensalidades", icon: CreditCard },
  { to: "/mural", label: "Mural", icon: MessageSquare },
]

const backofficeItems = [
  { to: "/backoffice", label: "Dashboard", icon: BarChart3 },
  { to: "/backoffice/transportadores", label: "Clientes", icon: Building2 },
  { to: "/backoffice/planos", label: "Planos", icon: ClipboardList },
  { to: "/backoffice/assinaturas", label: "Assinaturas", icon: Receipt },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const isSuperAdmin = user?.perfil === "SuperAdmin"
  const items = isSuperAdmin ? backofficeItems : navItems

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold shadow">
            🚐
          </div>
          <div>
            <p className="font-bold text-sm leading-none">TransEscolar</p>
            {isSuperAdmin && (
              <p className="text-xs text-sidebar-foreground/50 mt-0.5">Admin</p>
            )}
          </div>
        </div>
        {/* Botão fechar no mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navegação */}
      <nav className="flex-1 space-y-0.5 p-3">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          {isSuperAdmin ? "Backoffice" : "Menu"}
        </p>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/" || item.to === "/backoffice"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Rodapé */}
      <div className="p-3 space-y-1">
        {localStorage.getItem("token_superadmin") && (
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            onClick={() => {
              const t = localStorage.getItem("token_superadmin")!
              localStorage.setItem("token", t)
              localStorage.removeItem("token_superadmin")
              window.location.href = "/backoffice"
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Backoffice
          </button>
        )}

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-bold text-sidebar-primary-foreground flex-shrink-0">
            {user?.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate text-sidebar-foreground">{user?.nome}</p>
            <p className="text-xs text-sidebar-foreground/50">{user?.perfil}</p>
          </div>
        </div>

        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}

import { useAuth } from "@/contexts/AuthContext"
import { LogOut, User, Shield, Bell, HelpCircle } from "lucide-react"

export function PerfilPage() {
  const { user, logout } = useAuth()

  const menuItems = [
    { icon: Shield, label: "Segurança e Senha", color: "text-blue-500" },
    { icon: Bell, label: "Notificações", color: "text-amber-500" },
    { icon: HelpCircle, label: "Ajuda e Suporte", color: "text-slate-500" },
  ]

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center py-6 space-y-3">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-sm">
          <User className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">{user?.nome}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">
            {user?.perfil}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            className={`w-full p-4 flex items-center gap-4 active:bg-slate-50 transition-colors ${
              index !== menuItems.length - 1 ? 'border-b border-slate-50' : ''
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.color}`} />
            <span className="font-medium text-slate-700 flex-1 text-left">{item.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={logout}
        className="w-full h-14 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        Sair do Aplicativo
      </button>

      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest pt-4">
        TransEscolar v1.0.0
      </p>
    </div>
  )
}

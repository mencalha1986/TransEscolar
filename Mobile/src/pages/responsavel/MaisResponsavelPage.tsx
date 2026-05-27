import { useNavigate } from "react-router-dom"
import { GraduationCap, CreditCard, History, Phone, UserCircle, ChevronRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const menuItems = [
  {
    icon: GraduationCap,
    label: "Meus Filhos",
    description: "Informações dos seus filhos",
    path: "/meus-filhos",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: CreditCard,
    label: "Mensalidades",
    description: "Situação dos pagamentos",
    path: "/mensalidades/responsavel",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: History,
    label: "Histórico",
    description: "Embarques e desembarques",
    path: "/historico",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Phone,
    label: "Contato do Transportador",
    description: "Telefone e e-mail",
    path: "/contato-transportador",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: UserCircle,
    label: "Perfil",
    description: "Configurações e conta",
    path: "/perfil",
    color: "text-slate-600 bg-slate-100",
  },
]

export function MaisResponsavelPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Mais</h2>
        <p className="text-sm text-slate-500 mt-0.5">Olá, {user?.nome}</p>
      </div>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 active:bg-slate-50 transition-colors"
          >
            <div className={`p-3 rounded-xl ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  )
}

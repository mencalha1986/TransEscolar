import { useNavigate } from "react-router-dom"
import { School, MessageSquare, UserCircle, Receipt, ChevronRight, CircleDollarSign, Fuel } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const menuItemsBase = [
  {
    icon: CircleDollarSign,
    label: "Financeiro",
    description: "Mensalidades e cobranças",
    path: "/mensalidades",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: School,
    label: "Escolas",
    description: "Gerencie as escolas atendidas",
    path: "/escolas",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: MessageSquare,
    label: "Mural de Recados",
    description: "Comunicados e mensagens",
    path: "/mural",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Receipt,
    label: "Minha Assinatura",
    description: "Status e pagamento via PIX",
    path: "/minha-assinatura",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: UserCircle,
    label: "Perfil",
    description: "Configurações e conta",
    path: "/perfil",
    color: "text-slate-600 bg-slate-100",
  },
]

const itemDespesas = {
  icon: Fuel,
  label: "Minhas Despesas",
  description: "Combustível, pedágio, manutenção...",
  path: "/financeiro/despesas",
  color: "text-orange-600 bg-orange-50",
}

export function MaisPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const menuItems = user?.temModuloFinanceiro
    ? [menuItemsBase[0], itemDespesas, ...menuItemsBase.slice(1)]
    : menuItemsBase

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

import { useNavigate } from "react-router-dom"
import { ChevronLeft, Phone, Mail, Building2 } from "lucide-react"
import { usePerfilResponsavel } from "@/hooks/useResponsaveis"

export function ContatoTransportadorPage() {
  const navigate = useNavigate()
  const { data: perfil, isLoading } = usePerfilResponsavel()
  const transportador = perfil?.transportador

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg active:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Contato</h2>
          <p className="text-xs text-slate-500">Dados do seu transportador</p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 h-40 animate-pulse" />
      ) : !transportador ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
          <p className="text-sm">Dados do transportador não disponíveis.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Empresa</p>
              <p className="font-semibold text-slate-900">{transportador.nomeEmpresa}</p>
            </div>
          </div>

          {transportador.telefone && (
            <a
              href={`tel:${transportador.telefone}`}
              className="flex items-center gap-3 p-3 bg-green-50 rounded-xl active:opacity-80"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Telefone</p>
                <p className="font-semibold text-green-700">{transportador.telefone}</p>
              </div>
            </a>
          )}

          <a
            href={`mailto:${transportador.email}`}
            className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl active:opacity-80"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">E-mail</p>
              <p className="font-semibold text-blue-700">{transportador.email}</p>
            </div>
          </a>
        </div>
      )}
    </div>
  )
}

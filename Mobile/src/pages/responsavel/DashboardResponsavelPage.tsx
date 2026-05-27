import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { usePerfilResponsavel } from "@/hooks/useResponsaveis"
import { useMensalidades } from "@/hooks/useMensalidades"
import { listarCheckIns } from "@/services/transportes.service"
import { CreditCard, AlertTriangle, MapPin } from "lucide-react"

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export function DashboardResponsavelPage() {
  const { user } = useAuth()
  const { data: perfil, isLoading: loadingPerfil } = usePerfilResponsavel()
  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])

  const { data: todasMensalidades = [], isLoading: loadingMens } = useMensalidades()
  const mensalidades = todasMensalidades.filter(m => alunoIds.has(m.alunoId))
  const pendentes = mensalidades.filter(m => m.status === "Pendente")
  const atrasadas = mensalidades.filter(m => m.status === "Atrasado")

  const hoje = new Date().toISOString().slice(0, 10)
  const { data: checkIns = [], isLoading: loadingCheckins } = useQuery({
    queryKey: ["checkins", hoje],
    queryFn: () => listarCheckIns(hoje),
    enabled: alunoIds.size > 0,
  })
  const checkInsHoje = checkIns.filter(c => alunoIds.has(c.alunoId))

  return (
    <div className="p-4 space-y-5">
      <section>
        <h2 className="text-2xl font-bold text-slate-900">Olá, {user?.nome?.split(" ")[0]}! 👋</h2>
        <p className="text-slate-500 text-sm">Resumo do transporte escolar dos seus filhos.</p>
      </section>

      {loadingPerfil || loadingMens ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-slate-500 font-medium">Pendentes</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{pendentes.length}</p>
          </div>
          <div className={`bg-white p-4 rounded-2xl border ${atrasadas.length > 0 ? "border-red-200" : "border-slate-100"}`}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${atrasadas.length > 0 ? "text-red-500" : "text-slate-300"}`} />
              <p className="text-xs text-slate-500 font-medium">Atrasadas</p>
            </div>
            <p className={`text-2xl font-bold ${atrasadas.length > 0 ? "text-red-600" : "text-slate-900"}`}>
              {atrasadas.length}
            </p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Check-ins de hoje
        </h3>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loadingCheckins ? (
            <div className="p-4 space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : checkInsHoje.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">Nenhum check-in hoje.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {checkInsHoje.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.alunoNome}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.tipo === "Embarque" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {c.tipo}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{formatHora(c.horaRegistro)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

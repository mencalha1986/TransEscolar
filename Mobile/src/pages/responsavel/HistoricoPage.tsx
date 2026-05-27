import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { usePerfilResponsavel } from "@/hooks/useResponsaveis"
import { useCheckIns } from "@/hooks/useTransportes"

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export function HistoricoPage() {
  const navigate = useNavigate()
  const hoje = new Date().toISOString().slice(0, 10)
  const [data, setData] = useState(hoje)
  const [alunoId, setAlunoId] = useState("")

  const { data: perfil } = usePerfilResponsavel()
  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])

  const { data: checkIns = [], isLoading } = useCheckIns(data)

  const filtrados = checkIns.filter(c => {
    const doFilho = alunoIds.has(c.alunoId)
    const doSelecionado = !alunoId || c.alunoId === alunoId
    return doFilho && doSelecionado
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg active:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Histórico</h2>
          <p className="text-xs text-slate-500">Embarques e desembarques dos seus filhos</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={alunoId}
          onChange={e => setAlunoId(e.target.value)}
          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Todos</option>
          {perfil?.alunos.map(a => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-16 animate-pulse" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
          <p className="text-sm">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filtrados.map(c => (
              <div key={c.id} className="flex items-start gap-3 px-4 py-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${c.tipo === "Embarque" ? "bg-blue-500" : "bg-green-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.alunoNome}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.tipo === "Embarque" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {c.tipo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{formatHora(c.horaRegistro)}</p>
                  {c.endereco && (
                    <p className="text-xs text-slate-400 truncate">{c.endereco}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ChevronLeft, CalendarX, Trash2 } from "lucide-react"
import { usePerfilResponsavel } from "@/hooks/useResponsaveis"
import { useFaltas, useRegistrarFalta, useCancelarFalta } from "@/hooks/useFaltas"

function formatData(iso: string) {
  const [year, month, day] = iso.split("-")
  return `${day}/${month}/${year}`
}

const amanha = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

const hoje = new Date().toISOString().slice(0, 10)

export function AusenciaPage() {
  const navigate = useNavigate()
  const { data: perfil, isLoading: loadingPerfil } = usePerfilResponsavel()
  const [alunoId, setAlunoId] = useState("")
  const [data, setData] = useState(amanha)
  const [motivo, setMotivo] = useState("")

  const { data: faltas = [], isLoading: loadingFaltas } = useFaltas()
  const { mutateAsync: registrar, isPending: registrando } = useRegistrarFalta()
  const { mutateAsync: cancelar } = useCancelarFalta()

  const alunoIds = new Set(perfil?.alunos.map(a => a.id) ?? [])
  const faltasFilhas = faltas.filter(f => alunoIds.has(f.alunoId))

  async function onRegistrar() {
    if (!alunoId) { toast.error("Selecione o aluno"); return }
    if (!data) { toast.error("Selecione a data"); return }
    try {
      await registrar({ alunoId, data, motivo: motivo.trim() || undefined })
      toast.success("Ausência registrada!")
      setMotivo("")
      setData(amanha())
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar ausência")
    }
  }

  async function onCancelar(id: string) {
    if (!window.confirm("Cancelar esta ausência?")) return
    try {
      await cancelar(id)
      toast.success("Ausência cancelada.")
    } catch {
      toast.error("Não foi possível cancelar.")
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg active:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ausências</h2>
          <p className="text-xs text-slate-500">Informe quando seu filho não irá à escola</p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <CalendarX className="h-4 w-4 text-primary" />
          Registrar Ausência
        </h3>

        {loadingPerfil ? (
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        ) : (
          <select
            value={alunoId}
            onChange={e => setAlunoId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Selecione o aluno...</option>
            {perfil?.alunos.map(a => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Data da ausência</label>
          <input
            type="date"
            value={data}
            min={hoje}
            onChange={e => setData(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Motivo (opcional)</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm resize-none min-h-[72px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Ex: Consulta médica..."
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            maxLength={500}
          />
        </div>

        <button
          onClick={onRegistrar}
          disabled={registrando}
          className="w-full h-11 bg-primary text-white rounded-xl font-semibold text-sm active:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {registrando ? "Registrando..." : "Registrar Ausência"}
        </button>
      </div>

      {/* Lista */}
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Ausências Registradas</h3>
        {loadingFaltas ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-16 animate-pulse" />)}
          </div>
        ) : faltasFilhas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-slate-400">
            <p className="text-sm">Nenhuma ausência registrada.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-50">
              {faltasFilhas.map(f => (
                <div key={f.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 truncate">{f.alunoNome}</p>
                      <span className="text-sm font-semibold text-slate-500 flex-shrink-0">{formatData(f.data)}</span>
                    </div>
                    {f.motivo && <p className="text-xs text-slate-400 mt-0.5">{f.motivo}</p>}
                  </div>
                  <button
                    onClick={() => onCancelar(f.id)}
                    className="p-1.5 rounded-lg text-red-400 active:bg-red-50 flex-shrink-0"
                    aria-label="Cancelar ausência"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { useNavigate } from "react-router-dom"
import { ChevronLeft, GraduationCap, School, Clock } from "lucide-react"
import { usePerfilResponsavel } from "@/hooks/useResponsaveis"
import { useAluno } from "@/hooks/useAlunos"

const TURNO_LABEL: Record<string, string> = {
  Manha: "Manhã", Tarde: "Tarde", Noturno: "Noturno",
}

function FilhoCard({ alunoId }: { alunoId: string }) {
  const { data: aluno, isLoading } = useAluno(alunoId)

  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-slate-100 p-4 h-24 animate-pulse" />
  }
  if (!aluno) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 items-start">
      <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 flex-shrink-0">
        {aluno.fotoBase64 ? (
          <img
            src={`data:image/jpeg;base64,${aluno.fotoBase64}`}
            alt={aluno.nome}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          aluno.nome.charAt(0)
        )}
      </div>
      <div className="space-y-1 min-w-0">
        <p className="font-semibold text-slate-900 truncate">{aluno.nome}</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <School className="h-3 w-3" />
            {aluno.escolaNome}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {TURNO_LABEL[aluno.turno] ?? aluno.turno}
          </span>
        </div>
        {aluno.endereco && (
          <p className="text-xs text-slate-400">
            {aluno.endereco.logradouro}, {aluno.endereco.numero} — {aluno.endereco.bairro}
          </p>
        )}
      </div>
    </div>
  )
}

export function MeusFilhosPage() {
  const navigate = useNavigate()
  const { data: perfil, isLoading } = usePerfilResponsavel()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-lg active:bg-slate-100">
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Meus Filhos</h2>
          <p className="text-xs text-slate-500">Informações dos seus filhos no transporte</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="bg-white rounded-2xl border border-slate-100 h-24 animate-pulse" />)}
        </div>
      ) : !perfil?.alunos.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <GraduationCap className="h-10 w-10 mb-2 opacity-30" />
          <p className="text-sm">Nenhum filho vinculado ao seu perfil.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {perfil.alunos.map(a => <FilhoCard key={a.id} alunoId={a.id} />)}
        </div>
      )}
    </div>
  )
}

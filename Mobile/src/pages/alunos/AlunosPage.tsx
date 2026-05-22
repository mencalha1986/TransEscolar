import { useState } from "react"
import { useAlunos } from "@/hooks/useAlunos"
import { Search, MapPin, Phone } from "lucide-react"

export function AlunosPage() {
  const [search, setSearch] = useState("")
  const { data: alunos, isLoading } = useAlunos()

  const filteredAlunos = alunos?.filter(a =>
    a.nome.toLowerCase().includes(search.toLowerCase()) ||
    a.escolaNome.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-slate-900">Alunos</h2>
        <p className="text-slate-500">Gerenciamento de passageiros</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar aluno ou escola..."
          className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-10 text-center text-slate-500">Carregando alunos...</div>
        ) : filteredAlunos?.length === 0 ? (
          <div className="py-10 text-center text-slate-500">Nenhum aluno encontrado.</div>
        ) : (
          filteredAlunos?.map(aluno => (
            <div key={aluno.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {aluno.nome.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{aluno.nome}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {aluno.escolaNome}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                  {aluno.turno.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="text-xs">
                  <span className="text-slate-400">Vence dia:</span>
                  <span className="ml-1 font-semibold text-slate-700">{aluno.diaVencimento}</span>
                </div>
                <button className="text-primary text-sm font-bold flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Contato
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, User } from "lucide-react"
import { toast } from "sonner"
import { useAluno, useDeletarAluno } from "@/hooks/useAlunos"

function formatDate(dateStr: string) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("pt-BR")
}

function formatCPF(cpf: string) {
  const digits = cpf.replace(/\D/g, "")
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return phone
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function turnoLabel(turno: string) {
  return { Manha: "Manhã", Tarde: "Tarde", Noturno: "Noturno" }[turno] ?? turno
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-2 border-b border-slate-50 last:border-b-0">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  )
}

export function AlunoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: aluno, isLoading, error } = useAluno(id!)
  const { mutateAsync: deletar, isPending: deletando } = useDeletarAluno()
  const [confirmando, setConfirmando] = useState(false)

  async function handleDeletar() {
    try {
      await deletar(id!)
      toast.success("Aluno removido com sucesso")
      navigate("/alunos")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao remover aluno")
    }
  }

  return (
    <div className="pb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 active:opacity-70"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Voltar</span>
        </button>
        {aluno && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmando(true)}
              className="text-red-500 active:opacity-70"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate(`/alunos/${id}/editar`)}
              className="flex items-center gap-1.5 text-primary font-semibold active:opacity-70"
            >
              <Edit className="h-4 w-4" />
              Editar
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmando && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Remover aluno?</h3>
            <p className="text-sm text-slate-500">
              Esta ação não pode ser desfeita. O aluno e todos os seus dados serão removidos permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmando(false)}
                className="flex-1 h-12 bg-slate-100 text-slate-700 font-semibold rounded-xl active:opacity-70"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletar}
                disabled={deletando}
                className="flex-1 h-12 bg-red-600 text-white font-semibold rounded-xl active:opacity-80 disabled:opacity-50"
              >
                {deletando ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="m-4 text-red-600 text-sm">{(error as Error).message}</p>
      )}

      {isLoading ? (
        <div className="p-4 space-y-3">
          <div className="h-24 w-24 rounded-full bg-slate-200 animate-pulse mx-auto" />
          <div className="h-4 bg-slate-200 animate-pulse rounded w-48 mx-auto" />
          <div className="h-4 bg-slate-200 animate-pulse rounded w-32 mx-auto" />
        </div>
      ) : aluno ? (
        <div className="p-4 space-y-4">
          {/* Avatar + nome */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {aluno.fotoBase64 ? (
                <img
                  src={`data:image/jpeg;base64,${aluno.fotoBase64}`}
                  alt={aluno.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-primary/50" />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">{aluno.nome}</h2>
              <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full mt-1 inline-block">
                {turnoLabel(aluno.turno)}
              </span>
            </div>
          </div>

          {/* Dados do aluno */}
          <div className="bg-white rounded-2xl p-4 space-y-0 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Informações</h3>
            <InfoRow label="Data de Nascimento" value={formatDate(aluno.dataNascimento)} />
            <InfoRow label="Escola" value={aluno.escolaNome} />
            <InfoRow label="Mensalidade" value={formatCurrency(aluno.valorMensalidade)} />
            <InfoRow label="Dia de Vencimento" value={`Dia ${aluno.diaVencimento}`} />
          </div>

          {/* Endereço */}
          {aluno.endereco && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Endereço</h3>
              <InfoRow label="Logradouro" value={aluno.endereco.logradouro} />
              <InfoRow label="Número" value={aluno.endereco.numero} />
              <InfoRow label="Bairro" value={aluno.endereco.bairro} />
              <InfoRow label="Cidade" value={aluno.endereco.cidade} />
              <InfoRow label="Estado" value={aluno.endereco.estado} />
              <InfoRow label="CEP" value={aluno.endereco.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")} />
            </div>
          )}

          {/* Responsáveis */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Responsáveis</h3>
            {aluno.responsaveis.length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum responsável cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {aluno.responsaveis.map((resp, idx) => (
                  <div key={resp.id} className={idx > 0 ? "pt-4 border-t border-slate-100" : ""}>
                    <InfoRow label="Nome" value={resp.nome} />
                    <InfoRow label="CPF" value={formatCPF(resp.cpf)} />
                    <InfoRow label="Telefone" value={formatPhone(resp.telefone)} />
                    <InfoRow label="E-mail" value={resp.email} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

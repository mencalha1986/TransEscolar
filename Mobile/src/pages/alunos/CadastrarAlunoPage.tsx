import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { useCadastrarAluno } from "@/hooks/useAlunos"
import { useEscolas } from "@/hooks/useEscolas"
import { buscarResponsavelPorCpf } from "@/services/responsaveis.service"

function formatCPF(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const schema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  dataNascimento: z.string().min(1, "Informe a data de nascimento"),
  escolaId: z.string().min(1, "Selecione a escola"),
  valorMensalidade: z.string().min(1, "Informe o valor"),
  diaVencimento: z.string().min(1, "Informe o dia"),
  turno: z.enum(["Manha", "Tarde", "Noturno"]),
  nomeResponsavel: z.string().min(1, "Nome do responsável é obrigatório"),
  emailResponsavel: z.string().email("Email inválido"),
  telefoneResponsavel: z.string().min(1, "Telefone é obrigatório"),
  cpfResponsavel: z.string().min(14, "CPF inválido"),
})

type FormValues = z.infer<typeof schema>

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-600 text-xs mt-1">{msg}</p>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold text-slate-700 mb-1">{children}</p>
}

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"

export function CadastrarAlunoPage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCadastrarAluno()
  const { data: escolas } = useEscolas()
  const [buscandoResp, setBuscandoResp] = useState(false)
  const [respEncontrado, setRespEncontrado] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { turno: "Manha" },
  })

  async function handleCpfChange(value: string, onChange: (v: string) => void) {
    const formatted = formatCPF(value)
    onChange(formatted)
    if (formatted.length === 14) {
      setBuscandoResp(true)
      const resp = await buscarResponsavelPorCpf(formatted.replace(/\D/g, ""))
      setBuscandoResp(false)
      if (resp) {
        setValue("nomeResponsavel", resp.nome)
        setValue("telefoneResponsavel", resp.telefone)
        setValue("emailResponsavel", resp.email)
        setRespEncontrado(true)
      } else {
        setRespEncontrado(false)
      }
    } else {
      setRespEncontrado(false)
    }
  }

  async function onSubmit(values: FormValues) {
    const fd = new FormData()
    fd.append("nome", values.nome)
    fd.append("dataNascimento", values.dataNascimento)
    fd.append("escolaId", values.escolaId)
    fd.append("valorMensalidade", values.valorMensalidade)
    fd.append("diaVencimento", values.diaVencimento)
    fd.append("turno", values.turno)
    fd.append("emailResponsavel", values.emailResponsavel)
    fd.append("nomeResponsavel", values.nomeResponsavel)
    fd.append("telefoneResponsavel", values.telefoneResponsavel)
    fd.append("cpfResponsavel", values.cpfResponsavel.replace(/\D/g, ""))
    try {
      await mutateAsync(fd)
      toast.success("Aluno cadastrado com sucesso!")
      navigate("/alunos")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao cadastrar aluno")
    }
  }

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate("/alunos")} className="text-slate-600 active:opacity-70">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Cadastrar Aluno</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        {/* Dados do aluno */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4">
          <h2 className="font-bold text-slate-700">Dados do Aluno</h2>

          <div>
            <FieldLabel>Nome completo</FieldLabel>
            <input className={inputClass} placeholder="Nome do aluno" {...register("nome")} />
            <FieldError msg={errors.nome?.message} />
          </div>

          <div>
            <FieldLabel>Data de Nascimento</FieldLabel>
            <input type="date" className={inputClass} {...register("dataNascimento")} />
            <FieldError msg={errors.dataNascimento?.message} />
          </div>

          <div>
            <FieldLabel>Turno</FieldLabel>
            <select className={inputClass} {...register("turno")}>
              <option value="Manha">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noturno">Noturno</option>
            </select>
          </div>

          <div>
            <FieldLabel>Escola</FieldLabel>
            <select className={inputClass} {...register("escolaId")}>
              <option value="">Selecione...</option>
              {escolas?.map(e => (
                <option key={e.id} value={e.id}>{e.nome} — {e.cidade}</option>
              ))}
            </select>
            <FieldError msg={errors.escolaId?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Mensalidade (R$)</FieldLabel>
              <input
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                placeholder="0,00"
                {...register("valorMensalidade")}
              />
              <FieldError msg={errors.valorMensalidade?.message} />
            </div>
            <div>
              <FieldLabel>Dia Vencimento</FieldLabel>
              <input
                type="number"
                min="1"
                max="31"
                className={inputClass}
                placeholder="10"
                {...register("diaVencimento")}
              />
              <FieldError msg={errors.diaVencimento?.message} />
            </div>
          </div>
        </div>

        {/* Responsável */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-700">Responsável</h2>
            {respEncontrado && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Encontrado
              </span>
            )}
          </div>

          <div>
            <FieldLabel>CPF</FieldLabel>
            <Controller
              control={control}
              name="cpfResponsavel"
              render={({ field }) => (
                <input
                  className={inputClass}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  value={field.value ?? ""}
                  maxLength={14}
                  onChange={(e) => handleCpfChange(e.target.value, field.onChange)}
                  disabled={buscandoResp}
                />
              )}
            />
            {buscandoResp && <p className="text-xs text-slate-500 mt-1">Buscando responsável...</p>}
            <FieldError msg={errors.cpfResponsavel?.message} />
          </div>

          <div>
            <FieldLabel>Nome do Responsável</FieldLabel>
            <input
              className={inputClass}
              placeholder="Nome completo"
              {...register("nomeResponsavel")}
              disabled={buscandoResp}
            />
            <FieldError msg={errors.nomeResponsavel?.message} />
          </div>

          <div>
            <FieldLabel>Email</FieldLabel>
            <input
              type="email"
              className={inputClass}
              placeholder="email@exemplo.com"
              {...register("emailResponsavel")}
              disabled={buscandoResp}
            />
            <p className="text-xs text-slate-400 mt-1">Acesso ao app será enviado para este email.</p>
            <FieldError msg={errors.emailResponsavel?.message} />
          </div>

          <div>
            <FieldLabel>Telefone / WhatsApp</FieldLabel>
            <Controller
              control={control}
              name="telefoneResponsavel"
              render={({ field }) => (
                <input
                  className={inputClass}
                  placeholder="(11) 99999-0000"
                  inputMode="tel"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  disabled={buscandoResp}
                />
              )}
            />
            <FieldError msg={errors.telefoneResponsavel?.message} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm active:opacity-80 disabled:opacity-60"
        >
          {isPending ? "Cadastrando..." : "Cadastrar Aluno"}
        </button>
      </form>
    </div>
  )
}

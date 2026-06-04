import { useEffect, useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useAluno, useEditarAluno } from "@/hooks/useAlunos"
import { useEscolas } from "@/hooks/useEscolas"
import { buscarResponsavelPorCpf } from "@/services/responsaveis.service"
import { buscarEnderecoPorCEP } from "@/services/viacep.service"
import { formatCEP, formatCPF, formatPhone } from "@/lib/masks"

const responsavelSchema = z.object({
  id: z.string().optional(),
  cpf: z.string().min(14, "CPF inválido"),
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
})

const schema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  dataNascimento: z.string().min(1, "Informe a data de nascimento"),
  escolaId: z.string().min(1, "Selecione a escola"),
  valorMensalidade: z.string().min(1, "Informe o valor"),
  diaVencimento: z.string().min(1, "Informe o dia"),
  turno: z.enum(["Manha", "Tarde", "Noturno"]),
  responsaveis: z.array(responsavelSchema).min(1, "Adicione ao menos um responsável"),
  enderecoCEP: z.string().optional(),
  enderecoLogradouro: z.string().optional(),
  enderecoNumero: z.string().optional(),
  enderecoBairro: z.string().optional(),
  enderecoCidade: z.string().optional(),
  enderecoEstado: z.string().optional(),
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

export function EditarAlunoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: aluno, isLoading } = useAluno(id!)
  const { mutateAsync, isPending } = useEditarAluno(id!)
  const { data: escolas } = useEscolas()
  const [buscandoResp, setBuscandoResp] = useState<number | null>(null)
  const [buscandoCEP, setBuscandoCEP] = useState(false)
  const [cepNaoEncontrado, setCepNaoEncontrado] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { turno: "Manha", responsaveis: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "responsaveis" })

  useEffect(() => {
    if (!aluno) return
    reset({
      nome: aluno.nome,
      dataNascimento: aluno.dataNascimento.slice(0, 10),
      escolaId: aluno.escolaId,
      valorMensalidade: String(aluno.valorMensalidade),
      diaVencimento: String(aluno.diaVencimento),
      turno: aluno.turno as FormValues["turno"],
      responsaveis: aluno.responsaveis.map(r => ({
        id: r.id,
        cpf: formatCPF(r.cpf),
        nome: r.nome,
        email: r.email,
        telefone: r.telefone,
      })),
      enderecoCEP: aluno.endereco?.cep
        ? aluno.endereco.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")
        : "",
      enderecoLogradouro: aluno.endereco?.logradouro ?? "",
      enderecoNumero: aluno.endereco?.numero ?? "",
      enderecoBairro: aluno.endereco?.bairro ?? "",
      enderecoCidade: aluno.endereco?.cidade ?? "",
      enderecoEstado: aluno.endereco?.estado ?? "",
    })
  }, [aluno, reset])

  async function handleCEPChange(value: string, onChange: (v: string) => void) {
    const formatted = formatCEP(value)
    onChange(formatted)
    setCepNaoEncontrado(false)

    if (formatted.length === 9) {
      setBuscandoCEP(true)
      const resultado = await buscarEnderecoPorCEP(formatted)
      setBuscandoCEP(false)
      if (resultado) {
        setValue("enderecoLogradouro", resultado.logradouro)
        setValue("enderecoBairro", resultado.bairro)
        setValue("enderecoCidade", resultado.localidade)
        setValue("enderecoEstado", resultado.uf)
      } else {
        setCepNaoEncontrado(true)
        setValue("enderecoLogradouro", "")
        setValue("enderecoBairro", "")
        setValue("enderecoCidade", "")
        setValue("enderecoEstado", "")
      }
    }
  }

  async function handleCpfChange(
    index: number,
    value: string,
    onChange: (v: string) => void
  ) {
    const formatted = formatCPF(value)
    onChange(formatted)
    if (formatted.length === 14) {
      setBuscandoResp(index)
      const resp = await buscarResponsavelPorCpf(formatted.replace(/\D/g, ""))
      setBuscandoResp(null)
      if (resp) {
        setValue(`responsaveis.${index}.nome`, resp.nome)
        setValue(`responsaveis.${index}.telefone`, resp.telefone)
        setValue(`responsaveis.${index}.email`, resp.email)
      }
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
    values.responsaveis.forEach((r, i) => {
      if (r.id) fd.append(`responsaveis[${i}].id`, r.id)
      fd.append(`responsaveis[${i}].cpf`, r.cpf.replace(/\D/g, ""))
      fd.append(`responsaveis[${i}].nome`, r.nome)
      fd.append(`responsaveis[${i}].email`, r.email)
      fd.append(`responsaveis[${i}].telefone`, r.telefone)
    })
    if (values.enderecoCEP) {
      fd.append("enderecoCEP", values.enderecoCEP.replace(/\D/g, ""))
      fd.append("enderecoLogradouro", values.enderecoLogradouro ?? "")
      fd.append("enderecoNumero", values.enderecoNumero ?? "")
      fd.append("enderecoBairro", values.enderecoBairro ?? "")
      fd.append("enderecoCidade", values.enderecoCidade ?? "")
      fd.append("enderecoEstado", values.enderecoEstado ?? "")
    }
    try {
      await mutateAsync(fd)
      toast.success("Aluno atualizado com sucesso!")
      navigate(`/alunos/${id}`)
    } catch (err) {
      toast.error((err as Error).message || "Erro ao atualizar aluno")
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-8 bg-slate-200 animate-pulse rounded w-48" />
        <div className="h-11 bg-slate-200 animate-pulse rounded-xl" />
      </div>
    )
  }

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-slate-600 active:opacity-70">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Editar Aluno</h1>
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

        {/* Endereço */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4">
          <h2 className="font-bold text-slate-700">Endereço <span className="text-xs font-normal text-slate-400">(opcional)</span></h2>

          <div>
            <FieldLabel>CEP</FieldLabel>
            <Controller
              control={control}
              name="enderecoCEP"
              render={({ field }) => (
                <input
                  className={inputClass}
                  placeholder="00000-000"
                  inputMode="numeric"
                  maxLength={9}
                  value={field.value ?? ""}
                  onChange={(e) => handleCEPChange(e.target.value, field.onChange)}
                  disabled={buscandoCEP}
                />
              )}
            />
            {buscandoCEP && <p className="text-xs text-slate-500 mt-1">Buscando endereço...</p>}
            {cepNaoEncontrado && <p className="text-xs text-red-600 mt-1">CEP não encontrado.</p>}
          </div>

          <div>
            <FieldLabel>Logradouro</FieldLabel>
            <input className={inputClass} placeholder="Rua, Avenida..." {...register("enderecoLogradouro")} disabled={buscandoCEP} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Número</FieldLabel>
              <input className={inputClass} placeholder="123" {...register("enderecoNumero")} />
            </div>
            <div>
              <FieldLabel>Bairro</FieldLabel>
              <input className={inputClass} {...register("enderecoBairro")} disabled={buscandoCEP} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Cidade</FieldLabel>
              <input className={inputClass} {...register("enderecoCidade")} disabled={buscandoCEP} />
            </div>
            <div>
              <FieldLabel>Estado (UF)</FieldLabel>
              <input className={inputClass} placeholder="SP" maxLength={2} {...register("enderecoEstado")} disabled={buscandoCEP} />
            </div>
          </div>
        </div>

        {/* Responsáveis */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-700">Responsáveis</h2>
            <button
              type="button"
              onClick={() => append({ id: undefined, cpf: "", nome: "", email: "", telefone: "" })}
              className="flex items-center gap-1 text-xs text-primary font-semibold active:opacity-70"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
          <FieldError msg={errors.responsaveis?.message} />

          {fields.map((field, idx) => (
            <div key={field.id} className="border border-slate-100 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Responsável {idx + 1}</span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-red-500 active:opacity-70"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div>
                <FieldLabel>CPF</FieldLabel>
                <Controller
                  control={control}
                  name={`responsaveis.${idx}.cpf`}
                  render={({ field: f }) => (
                    <input
                      className={inputClass}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      value={f.value ?? ""}
                      maxLength={14}
                      onChange={(e) => handleCpfChange(idx, e.target.value, f.onChange)}
                      disabled={buscandoResp === idx}
                    />
                  )}
                />
                {buscandoResp === idx && (
                  <p className="text-xs text-slate-500 mt-1">Buscando...</p>
                )}
              </div>

              <div>
                <FieldLabel>Nome</FieldLabel>
                <input
                  className={inputClass}
                  placeholder="Nome completo"
                  {...register(`responsaveis.${idx}.nome`)}
                />
                <FieldError msg={errors.responsaveis?.[idx]?.nome?.message} />
              </div>

              <div>
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  className={inputClass}
                  placeholder="email@exemplo.com"
                  {...register(`responsaveis.${idx}.email`)}
                />
                <FieldError msg={errors.responsaveis?.[idx]?.email?.message} />
              </div>

              <div>
                <FieldLabel>Telefone</FieldLabel>
                <Controller
                  control={control}
                  name={`responsaveis.${idx}.telefone`}
                  render={({ field: f }) => (
                    <input
                      className={inputClass}
                      placeholder="(11) 99999-0000"
                      inputMode="tel"
                      value={f.value ?? ""}
                      onChange={(e) => f.onChange(formatPhone(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm active:opacity-80 disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  )
}

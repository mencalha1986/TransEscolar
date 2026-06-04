import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { useCadastrarTransportador } from "@/hooks/useBackoffice"
import { usePlanos } from "@/hooks/useBackoffice"
import { formatCPFCNPJ, formatPhone } from "@/lib/masks"

const schema = z.object({
  nomeEmpresa: z.string().min(1, "Nome da empresa é obrigatório"),
  nomeContato: z.string().min(1, "Nome do contato é obrigatório"),
  cpfCnpj: z.string().min(1, "CPF/CNPJ é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  planoId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm"

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-600 text-xs mt-1">{msg}</p>
}

export function CadastrarTransportadorPage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useCadastrarTransportador()
  const { data: planos } = usePlanos()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await mutateAsync({
        nomeEmpresa: values.nomeEmpresa,
        nomeContato: values.nomeContato,
        cpfCnpj: values.cpfCnpj.replace(/\D/g, ""),
        email: values.email,
        telefone: values.telefone ? values.telefone.replace(/\D/g, "") : undefined,
        planoId: values.planoId || undefined,
      })
      toast.success("Transportador cadastrado!")
      navigate("/backoffice/transportadores")
    } catch (err) {
      toast.error((err as Error).message || "Erro ao cadastrar")
    }
  }

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-slate-600 active:opacity-70">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Novo Transportador</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
          <h2 className="font-bold text-slate-700">Dados da Empresa</h2>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Nome da Empresa *</p>
            <input className={inputClass} placeholder="Transportes Exemplo Ltda" {...register("nomeEmpresa")} />
            <FieldError msg={errors.nomeEmpresa?.message} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Nome do Contato *</p>
            <input className={inputClass} placeholder="Nome do responsável" {...register("nomeContato")} />
            <FieldError msg={errors.nomeContato?.message} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">CPF / CNPJ *</p>
            <Controller
              control={control}
              name="cpfCnpj"
              render={({ field }) => (
                <input
                  className={inputClass}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  value={field.value ?? ""}
                  maxLength={18}
                  onChange={(e) => field.onChange(formatCPFCNPJ(e.target.value))}
                />
              )}
            />
            <FieldError msg={errors.cpfCnpj?.message} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Email *</p>
            <input type="email" className={inputClass} placeholder="email@empresa.com" {...register("email")} />
            <FieldError msg={errors.email?.message} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Telefone</p>
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <input
                  className={inputClass}
                  placeholder="(11) 99999-0000"
                  inputMode="tel"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                />
              )}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Plano (opcional)</p>
            <select className={inputClass} {...register("planoId")}>
              <option value="">Sem plano</option>
              {planos?.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {p.precoMensal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm active:opacity-80 disabled:opacity-60"
        >
          {isPending ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  )
}

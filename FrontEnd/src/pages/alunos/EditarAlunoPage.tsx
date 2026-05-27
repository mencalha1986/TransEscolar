import { useEffect, useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchSelect } from "@/components/ui/search-select"
import { useAluno, useEditarAluno } from "@/hooks/useAlunos"
import { useEscolas } from "@/hooks/useEscolas"
import { formatCPFCNPJ, formatPhone, formatCEP, onlyDigitsKeyDown, blockNumberExtras } from "@/lib/masks"
import { compressImage } from "@/lib/imageUtils"
import { buscarResponsavelPorCpf } from "@/services/responsaveis.service"
import { buscarEnderecoPorCEP } from "@/services/viacep.service"

const responsavelSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email("Email inválido"),
})

const schema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  dataNascimento: z.string().min(1, "Informe a data de nascimento"),
  escolaId: z.string().min(1, "Informe a escola"),
  valorMensalidade: z.string().min(1, "Informe o valor da mensalidade"),
  diaVencimento: z.string().min(1, "Informe o dia de vencimento"),
  turno: z.enum(["Manha", "Tarde", "Noturno"]),
  responsaveis: z.array(responsavelSchema),
  foto: z.instanceof(FileList).optional(),
  enderecoCEP: z.string().optional(),
  enderecoLogradouro: z.string().optional(),
  enderecoNumero: z.string().optional(),
  enderecoBairro: z.string().optional(),
  enderecoCidade: z.string().optional(),
  enderecoEstado: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type NovoResponsavelForm = { cpf: string; nome: string; telefone: string; email: string }
type NovoResponsavelErrors = Partial<Record<keyof NovoResponsavelForm, string>>

export function EditarAlunoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: aluno, isLoading } = useAluno(id!)
  const { data: escolas } = useEscolas()
  const { mutateAsync, isPending } = useEditarAluno(id!)

  const [buscandoCEP, setBuscandoCEP] = useState(false)
  const [cepNaoEncontrado, setCepNaoEncontrado] = useState(false)
  const [adicionarResp, setAdicionarResp] = useState(false)
  const [novoResp, setNovoResp] = useState<NovoResponsavelForm>({ cpf: "", nome: "", telefone: "", email: "" })
  const [novoRespErrors, setNovoRespErrors] = useState<NovoResponsavelErrors>({})
  const [buscandoNovoResp, setBuscandoNovoResp] = useState(false)
  const [novoRespEncontrado, setNovoRespEncontrado] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { turno: "Manha", responsaveis: [] },
  })

  const { fields } = useFieldArray({ control, name: "responsaveis" })

  const escolaId = watch("escolaId")

  useEffect(() => {
    if (!aluno) return
    reset({
      nome: aluno.nome,
      dataNascimento: aluno.dataNascimento.slice(0, 10),
      escolaId: aluno.escolaId,
      valorMensalidade: String(aluno.valorMensalidade),
      diaVencimento: String(aluno.diaVencimento),
      turno: aluno.turno as FormValues["turno"],
      responsaveis: aluno.responsaveis.map((r) => ({
        id: r.id,
        nome: r.nome,
        telefone: r.telefone,
        email: r.email,
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

  const escolaOptions = (escolas ?? []).map((e) => ({
    value: e.id,
    label: `${e.nome} — ${e.cidade}`,
  }))

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

  async function handleCpfNovoResp(value: string) {
    const formatted = formatCPFCNPJ(value)
    setNovoResp((p) => ({ ...p, cpf: formatted }))

    if (formatted.length === 14) {
      setBuscandoNovoResp(true)
      const resp = await buscarResponsavelPorCpf(formatted.replace(/\D/g, ""))
      setBuscandoNovoResp(false)
      if (resp) {
        setNovoResp((p) => ({ ...p, nome: resp.nome, telefone: resp.telefone, email: resp.email }))
        setNovoRespEncontrado(true)
      } else {
        setNovoRespEncontrado(false)
      }
    } else {
      setNovoRespEncontrado(false)
    }
  }

  async function onSubmit(values: FormValues) {
    if (adicionarResp) {
      const errs: NovoResponsavelErrors = {}
      const cpfDigits = novoResp.cpf.replace(/\D/g, "")
      if (cpfDigits.length < 11) errs.cpf = "CPF inválido"
      if (!novoResp.nome.trim()) errs.nome = "Nome é obrigatório"
      if (!novoResp.telefone.trim()) errs.telefone = "Telefone é obrigatório"
      if (!novoResp.email.includes("@")) errs.email = "Email inválido"
      if (Object.keys(errs).length > 0) {
        setNovoRespErrors(errs)
        return
      }
      setNovoRespErrors({})
    }

    const fd = new FormData()
    fd.append("nome", values.nome)
    fd.append("dataNascimento", values.dataNascimento)
    fd.append("escolaId", values.escolaId)
    fd.append("valorMensalidade", values.valorMensalidade)
    fd.append("diaVencimento", values.diaVencimento)
    fd.append("turno", values.turno)
    if (values.responsaveis.length > 0)
      fd.append("responsaveisJson", JSON.stringify(values.responsaveis))
    if (adicionarResp)
      fd.append("novoResponsavelJson", JSON.stringify({ cpf: novoResp.cpf.replace(/\D/g, ""), nome: novoResp.nome, telefone: novoResp.telefone, email: novoResp.email }))
    if (values.enderecoCEP) {
      fd.append("enderecoCEP", values.enderecoCEP.replace(/\D/g, ""))
      fd.append("enderecoLogradouro", values.enderecoLogradouro ?? "")
      fd.append("enderecoNumero", values.enderecoNumero ?? "")
      fd.append("enderecoBairro", values.enderecoBairro ?? "")
      fd.append("enderecoCidade", values.enderecoCidade ?? "")
      fd.append("enderecoEstado", values.enderecoEstado ?? "")
    }
    if (values.foto?.[0]) {
      const compressed = await compressImage(values.foto[0])
      fd.append("foto", compressed)
    }

    try {
      await mutateAsync(fd)
      toast.success("Aluno atualizado com sucesso!")
      navigate(`/alunos/${id}`)
    } catch {
      toast.error("Não foi possível atualizar o aluno.")
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Editar Aluno" />
        <div className="space-y-3 max-w-xl">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Editar Aluno"
        actions={<Button variant="outline" onClick={() => navigate(`/alunos/${id}`)}>Cancelar</Button>}
      />
      <div className="space-y-4 max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Dados do Aluno</CardTitle></CardHeader>
          <CardContent>
            <form id="form-editar" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" {...register("nome")} />
                {errors.nome && <p className="text-destructive text-sm">{errors.nome.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input id="dataNascimento" type="date" {...register("dataNascimento")} />
                {errors.dataNascimento && <p className="text-destructive text-sm">{errors.dataNascimento.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Turno</Label>
                <Controller
                  control={control}
                  name="turno"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manha">Manhã</SelectItem>
                        <SelectItem value="Tarde">Tarde</SelectItem>
                        <SelectItem value="Noturno">Noturno</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label>Escola</Label>
                <SearchSelect
                  options={escolaOptions}
                  value={escolaId ?? ""}
                  onChange={(v) => setValue("escolaId", v, { shouldValidate: true })}
                  placeholder="Buscar escola..."
                  emptyMessage="Nenhuma escola encontrada."
                />
                {errors.escolaId && <p className="text-destructive text-sm">{errors.escolaId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="valorMensalidade">Mensalidade (R$)</Label>
                  <Input id="valorMensalidade" type="number" step="0.01" min="0" {...register("valorMensalidade")} onKeyDown={blockNumberExtras} />
                  {errors.valorMensalidade && <p className="text-destructive text-sm">{errors.valorMensalidade.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="diaVencimento">Dia de Vencimento</Label>
                  <Input id="diaVencimento" type="number" min="1" max="28" {...register("diaVencimento")} onKeyDown={blockNumberExtras} />
                  {errors.diaVencimento && <p className="text-destructive text-sm">{errors.diaVencimento.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="foto">Foto (deixe vazio para manter a atual)</Label>
                <Input id="foto" type="file" accept="image/*" {...register("foto")} />
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Endereço <span className="text-xs font-normal text-muted-foreground">(opcional)</span></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="enderecoCEP">CEP</Label>
              <Controller
                control={control}
                name="enderecoCEP"
                render={({ field }) => (
                  <Input
                    id="enderecoCEP"
                    placeholder="00000-000"
                    inputMode="numeric"
                    onKeyDown={onlyDigitsKeyDown}
                    maxLength={9}
                    value={field.value ?? ""}
                    onChange={(e) => handleCEPChange(e.target.value, field.onChange)}
                    disabled={buscandoCEP}
                  />
                )}
              />
              {buscandoCEP && <p className="text-xs text-muted-foreground">Buscando endereço...</p>}
              {cepNaoEncontrado && <p className="text-xs text-destructive">CEP não encontrado.</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="enderecoLogradouro">Logradouro</Label>
              <Input id="enderecoLogradouro" {...register("enderecoLogradouro")} placeholder="Rua, Avenida..." disabled={buscandoCEP} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="enderecoNumero">Número</Label>
                <Input id="enderecoNumero" {...register("enderecoNumero")} placeholder="123" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="enderecoBairro">Bairro</Label>
                <Input id="enderecoBairro" {...register("enderecoBairro")} disabled={buscandoCEP} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="enderecoCidade">Cidade</Label>
                <Input id="enderecoCidade" {...register("enderecoCidade")} disabled={buscandoCEP} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="enderecoEstado">Estado (UF)</Label>
                <Input id="enderecoEstado" {...register("enderecoEstado")} maxLength={2} placeholder="SP" disabled={buscandoCEP} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Responsáveis</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Nome</Label>
                    <Input {...register(`responsaveis.${index}.nome`)} />
                    {errors.responsaveis?.[index]?.nome && (
                      <p className="text-destructive text-sm">{errors.responsaveis[index].nome?.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Telefone</Label>
                      <Controller
                        control={control}
                        name={`responsaveis.${index}.telefone`}
                        render={({ field: f }) => (
                          <Input
                            {...f}
                            inputMode="numeric"
                            onKeyDown={onlyDigitsKeyDown}
                            onChange={(e) => f.onChange(formatPhone(e.target.value))}
                          />
                        )}
                      />
                      {errors.responsaveis?.[index]?.telefone && (
                        <p className="text-destructive text-sm">{errors.responsaveis[index].telefone?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input type="email" {...register(`responsaveis.${index}.email`)} />
                      {errors.responsaveis?.[index]?.email && (
                        <p className="text-destructive text-sm">{errors.responsaveis[index].email?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {fields.length === 0 && !adicionarResp && (
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="text-sm text-muted-foreground">Nenhum responsável cadastrado.</p>
                <Button type="button" variant="outline" onClick={() => setAdicionarResp(true)}>
                  + Adicionar Responsável
                </Button>
              </div>
            )}

            {adicionarResp && (
              <div className="space-y-4">
                {fields.length > 0 && <Separator />}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label>CPF do Responsável</Label>
                    {novoRespEncontrado && <span className="text-xs text-green-600 font-medium">Responsável encontrado</span>}
                  </div>
                  <Input
                    value={novoResp.cpf}
                    inputMode="numeric"
                    maxLength={14}
                    onKeyDown={onlyDigitsKeyDown}
                    onChange={(e) => handleCpfNovoResp(e.target.value)}
                    disabled={buscandoNovoResp}
                  />
                  {buscandoNovoResp && <p className="text-xs text-muted-foreground">Buscando responsável...</p>}
                  {novoRespErrors.cpf && <p className="text-destructive text-sm">{novoRespErrors.cpf}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Nome</Label>
                  <Input
                    value={novoResp.nome}
                    disabled={buscandoNovoResp}
                    onChange={(e) => setNovoResp((p) => ({ ...p, nome: e.target.value }))}
                  />
                  {novoRespErrors.nome && <p className="text-destructive text-sm">{novoRespErrors.nome}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Telefone</Label>
                    <Input
                      value={novoResp.telefone}
                      inputMode="numeric"
                      onKeyDown={onlyDigitsKeyDown}
                      disabled={buscandoNovoResp}
                      onChange={(e) => setNovoResp((p) => ({ ...p, telefone: formatPhone(e.target.value) }))}
                    />
                    {novoRespErrors.telefone && <p className="text-destructive text-sm">{novoRespErrors.telefone}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={novoResp.email}
                      disabled={buscandoNovoResp}
                      onChange={(e) => setNovoResp((p) => ({ ...p, email: e.target.value }))}
                    />
                    {novoRespErrors.email && <p className="text-destructive text-sm">{novoRespErrors.email}</p>}
                  </div>
                </div>
                <Button type="button" variant="ghost" className="text-sm text-muted-foreground" onClick={() => { setAdicionarResp(false); setNovoResp({ cpf: "", nome: "", telefone: "", email: "" }); setNovoRespErrors({}); setNovoRespEncontrado(false) }}>
                  Cancelar adição
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" form="form-editar" className="w-full" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  )
}

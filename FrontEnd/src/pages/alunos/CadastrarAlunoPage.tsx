import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchSelect } from "@/components/ui/search-select"
import { useCadastrarAluno } from "@/hooks/useAlunos"
import { useEscolas } from "@/hooks/useEscolas"
import { formatCPFCNPJ, formatPhone, onlyDigitsKeyDown, blockNumberExtras } from "@/lib/masks"
import { compressImage } from "@/lib/imageUtils"
import { buscarResponsavelPorCpf } from "@/services/responsaveis.service"

const schema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  dataNascimento: z.string().min(1, "Informe a data de nascimento"),
  escolaId: z.string().min(1, "Informe o ID da escola"),
  valorMensalidade: z.string().min(1, "Informe o valor da mensalidade"),
  diaVencimento: z.string().min(1, "Informe o dia de vencimento"),
  turno: z.enum(["Manha", "Tarde", "Noturno"]),
  nomeResponsavel: z.string().min(1, "Nome do responsável é obrigatório"),
  emailResponsavel: z.string().email("Email inválido"),
  telefoneResponsavel: z.string().min(1, "Telefone do responsável é obrigatório"),
  cpfResponsavel: z.string().min(14, "CPF inválido"),
  foto: z.instanceof(FileList).optional(),
})

type FormValues = z.infer<typeof schema>

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

  const turno = watch("turno")
  const escolaId = watch("escolaId")

  const escolaOptions = (escolas ?? []).map((e) => ({
    value: e.id,
    label: `${e.nome} — ${e.cidade}`,
  }))

  async function handleCpfChange(value: string, onChange: (v: string) => void) {
    const formatted = formatCPFCNPJ(value)
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
    if (values.foto?.[0]) {
      const compressed = await compressImage(values.foto[0])
      fd.append("foto", compressed)
    }

    try {
      await mutateAsync(fd)
      toast.success("Aluno cadastrado com sucesso!")
      navigate("/alunos")
    } catch {
      toast.error("Não foi possível cadastrar o aluno. Verifique os dados e tente novamente.")
    }
  }

  return (
    <div>
      <PageHeader
        title="Cadastrar Aluno"
        actions={<Button variant="outline" onClick={() => navigate("/alunos")}>Voltar</Button>}
      />
      <div className="space-y-4 max-w-xl">
        <Card>
          <CardHeader><CardTitle className="text-base">Dados do Aluno</CardTitle></CardHeader>
          <CardContent>
            <form id="form-aluno" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Select value={turno} onValueChange={(v) => setValue("turno", v as FormValues["turno"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manha">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noturno">Noturno</SelectItem>
                  </SelectContent>
                </Select>
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
                {escolaOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma escola cadastrada. <a href="/escolas" className="underline">Cadastrar escola</a></p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="valorMensalidade">Valor da Mensalidade (R$)</Label>
                  <Input id="valorMensalidade" type="number" step="0.01" min="0" {...register("valorMensalidade")} placeholder="0,00" onKeyDown={blockNumberExtras} />
                  {errors.valorMensalidade && <p className="text-destructive text-sm">{errors.valorMensalidade.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="diaVencimento">Dia de Vencimento</Label>
                  <Input id="diaVencimento" type="number" min="1" max="31" {...register("diaVencimento")} placeholder="10" onKeyDown={blockNumberExtras} />
                  {errors.diaVencimento && <p className="text-destructive text-sm">{errors.diaVencimento.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="foto">Foto (opcional)</Label>
                <Input id="foto" type="file" accept="image/*" {...register("foto")} />
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Responsável</CardTitle>
              {respEncontrado && <Badge variant="secondary">Responsável encontrado</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="cpfResponsavel">CPF</Label>
              <Controller
                control={control}
                name="cpfResponsavel"
                render={({ field }) => (
                  <Input
                    id="cpfResponsavel"
                    value={field.value ?? ""}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    onKeyDown={onlyDigitsKeyDown}
                    onChange={(e) => handleCpfChange(e.target.value, field.onChange)}
                    maxLength={14}
                    disabled={buscandoResp}
                  />
                )}
              />
              {buscandoResp && <p className="text-xs text-muted-foreground">Buscando responsável...</p>}
              {errors.cpfResponsavel && <p className="text-destructive text-sm">{errors.cpfResponsavel.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="nomeResponsavel">Nome (Pai / Mãe / Responsável)</Label>
              <Input id="nomeResponsavel" {...register("nomeResponsavel")} placeholder="Nome completo do responsável" disabled={buscandoResp} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="emailResponsavel">Email</Label>
              <Input id="emailResponsavel" type="email" {...register("emailResponsavel")} placeholder="email@exemplo.com" disabled={buscandoResp} />
              {errors.emailResponsavel && <p className="text-destructive text-sm">{errors.emailResponsavel.message}</p>}
              <p className="text-xs text-muted-foreground">Um acesso ao aplicativo será enviado para este email.</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="telefoneResponsavel">Telefone / WhatsApp</Label>
              <Controller
                control={control}
                name="telefoneResponsavel"
                render={({ field }) => (
                  <Input
                    id="telefoneResponsavel"
                    {...field}
                    value={field.value ?? ""}
                    placeholder="(11) 99999-0000"
                    inputMode="numeric"
                    onKeyDown={onlyDigitsKeyDown}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    disabled={buscandoResp}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" form="form-aluno" className="w-full" disabled={isPending}>
          {isPending ? "Cadastrando..." : "Cadastrar Aluno"}
        </Button>
      </div>
    </div>
  )
}

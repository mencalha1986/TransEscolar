import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { backofficeService } from "@/services/backoffice.service"
import { formatPhone, formatCPFCNPJ, onlyDigitsKeyDown } from "@/lib/masks"

export function CadastrarTransportadorPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nomeEmpresa: "", nomeContato: "", cpfCnpj: "", email: "", telefone: "" })

  const mutation = useMutation({
    mutationFn: () => backofficeService.cadastrarTransportador({ ...form }),
    onSuccess: () => {
      toast.success("Transportador cadastrado com sucesso!")
      navigate("/backoffice/transportadores")
    },
    onError: (err: Error) => toast.error(err.message || "Erro ao cadastrar transportador"),
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div>
      <PageHeader title="Novo Transportador" description="Cadastrar um novo cliente na plataforma" />
      <Card className="max-w-lg">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1">
            <Label>Nome da Empresa</Label>
            <Input value={form.nomeEmpresa} onChange={set("nomeEmpresa")} placeholder="Ex: TransEscolar Ltda" />
          </div>
          <div className="space-y-1">
            <Label>Nome do Contato</Label>
            <Input value={form.nomeContato} onChange={set("nomeContato")} />
          </div>
          <div className="space-y-1">
            <Label>CPF / CNPJ</Label>
            <Input
              value={form.cpfCnpj}
              inputMode="numeric"
              onKeyDown={onlyDigitsKeyDown}
              onChange={(e) => setForm((f) => ({ ...f, cpfCnpj: formatCPFCNPJ(e.target.value) }))}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={set("email")} />
          </div>
          <div className="space-y-1">
            <Label>Telefone</Label>
            <Input
              value={form.telefone}
              inputMode="numeric"
              onKeyDown={onlyDigitsKeyDown}
              onChange={(e) => setForm((f) => ({ ...f, telefone: formatPhone(e.target.value) }))}
              placeholder="(11) 99999-0000"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Cadastrar"}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

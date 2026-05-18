import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { alterarSenha } from "@/services/auth.service"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const schema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual"),
    novaSenha: z.string().min(6, "A nova senha deve ter ao menos 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((v) => v.novaSenha === v.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })

type FormValues = z.infer<typeof schema>

export function AlterarSenhaPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await alterarSenha({ senhaAtual: values.senhaAtual, novaSenha: values.novaSenha })
      sessionStorage.removeItem("mustChangePassword")
      toast.success("Senha alterada com sucesso!")
      navigate("/")
    } catch (err) {
      toast.error("Não foi possível alterar a senha. Verifique a senha atual e tente novamente.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Você precisa alterar sua senha antes de continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="senhaAtual">Senha Atual</Label>
              <Input id="senhaAtual" type="password" {...register("senhaAtual")} />
              {errors.senhaAtual && <p className="text-destructive text-sm">{errors.senhaAtual.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <Input id="novaSenha" type="password" {...register("novaSenha")} />
              {errors.novaSenha && <p className="text-destructive text-sm">{errors.novaSenha.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <Input id="confirmarSenha" type="password" {...register("confirmarSenha")} />
              {errors.confirmarSenha && <p className="text-destructive text-sm">{errors.confirmarSenha.message}</p>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
              <Button type="button" variant="outline" onClick={logout}>
                Sair
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { Bus } from "lucide-react"

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      const { mustChangePassword } = await login(values)
      if (mustChangePassword) {
        navigate("/perfil")
        toast.info("Por favor, altere sua senha no perfil.")
      } else {
        navigate("/dashboard")
      }
    } catch (err) {
      toast.error("Email ou senha incorretos.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white px-6">
      <div className="flex-1 flex flex-col justify-center py-12">
        <div className="flex justify-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full">
            <Bus className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">TransEscolar</h1>
          <p className="text-slate-500 mt-2">Bem-vindo ao seu portal mobile</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
              placeholder="seu@email.com"
              {...register("email")}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
              placeholder="••••••••"
              {...register("senha")}
            />
            {errors.senha && <p className="text-red-500 text-xs">{errors.senha.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50 shadow-lg shadow-primary/25 mt-4"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <footer className="py-8 text-center text-slate-400 text-sm">
        Versão 1.0.0
      </footer>
    </div>
  )
}

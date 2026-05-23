import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Bus, Fingerprint } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import {
  biometricIsAvailable,
  biometricHasCredentials,
  biometricAuthenticate,
  biometricSaveCredentials,
} from "@/hooks/useBiometric"

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [canUseBiometric, setCanUseBiometric] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [pendingCredentials, setPendingCredentials] = useState<FormValues | null>(null)
  const [biometricLoading, setBiometricLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    async function checkBiometric() {
      const available = await biometricIsAvailable()
      if (!available) return
      const hasCredentials = await biometricHasCredentials()
      setCanUseBiometric(hasCredentials)
    }
    checkBiometric()
  }, [])

  async function onSubmit(values: FormValues) {
    try {
      const { mustChangePassword } = await login(values)
      const available = await biometricIsAvailable()
      const alreadySaved = await biometricHasCredentials()
      if (available && !alreadySaved) {
        setPendingCredentials(values)
        setShowActivateModal(true)
        return
      }
      if (mustChangePassword) {
        navigate("/perfil")
        toast.info("Por favor, altere sua senha no perfil.")
      } else {
        navigate("/dashboard")
      }
    } catch {
      toast.error("Email ou senha incorretos.")
    }
  }

  async function handleActivateBiometric() {
    if (!pendingCredentials) return
    setShowActivateModal(false)
    try {
      await biometricSaveCredentials(pendingCredentials.email, pendingCredentials.senha)
      setCanUseBiometric(true)
      toast.success("Biometria ativada com sucesso!")
    } catch {
      toast.error("Não foi possível ativar a biometria.")
    }
    navigate("/dashboard")
  }

  function handleDismissActivate() {
    setShowActivateModal(false)
    navigate("/dashboard")
  }

  async function handleBiometricLogin() {
    setBiometricLoading(true)
    try {
      const { username, password } = await biometricAuthenticate()
      const { mustChangePassword } = await login({ email: username, senha: password })
      if (mustChangePassword) {
        navigate("/perfil")
        toast.info("Por favor, altere sua senha no perfil.")
      } else {
        navigate("/dashboard")
      }
    } catch {
      toast.error("Biometria cancelada. Use sua senha.")
    } finally {
      setBiometricLoading(false)
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

        {canUseBiometric && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">ou</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <button
              onClick={handleBiometricLogin}
              disabled={biometricLoading}
              className="w-full h-14 flex items-center justify-center gap-3 border-2 border-primary/30 rounded-xl text-primary font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              <Fingerprint className="h-6 w-6" />
              {biometricLoading ? "Verificando..." : "Entrar com biometria"}
            </button>
          </>
        )}
      </div>

      <footer className="py-8 text-center text-slate-400 text-sm">
        Versão 1.0.0
      </footer>

      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-xl">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-full">
                <Fingerprint className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Ativar login biométrico?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Entre mais rápido usando impressão digital ou Face ID nas próximas vezes.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDismissActivate}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 active:bg-slate-50"
              >
                Agora não
              </button>
              <button
                onClick={handleActivateBiometric}
                className="flex-1 h-11 rounded-xl bg-primary text-sm font-semibold text-white active:opacity-80"
              >
                Ativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

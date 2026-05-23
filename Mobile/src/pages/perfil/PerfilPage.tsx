import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { alterarSenha } from "@/services/auth.service"
import { LogOut, User, Shield, Bell, HelpCircle, ChevronRight, ArrowLeft, Eye, EyeOff, Fingerprint } from "lucide-react"
import { biometricIsAvailable, biometricHasCredentials, biometricDeleteCredentials } from "@/hooks/useBiometric"

const senhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual"),
    novaSenha: z.string().min(6, "Nova senha deve ter ao menos 6 caracteres"),
    confirmar: z.string().min(1, "Confirme a nova senha"),
  })
  .refine(d => d.novaSenha === d.confirmar, {
    message: "As senhas não conferem",
    path: ["confirmar"],
  })

type SenhaForm = z.infer<typeof senhaSchema>

const inputClass =
  "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 text-sm"

function AlterarSenhaView({ onBack }: { onBack: () => void }) {
  const [showAtual, setShowAtual] = useState(false)
  const [showNova, setShowNova] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SenhaForm>({ resolver: zodResolver(senhaSchema) })

  async function onSubmit(values: SenhaForm) {
    setLoading(true)
    try {
      await alterarSenha({ senhaAtual: values.senhaAtual, novaSenha: values.novaSenha })
      toast.success("Senha alterada com sucesso!")
      reset()
      onBack()
    } catch (err) {
      toast.error((err as Error).message || "Erro ao alterar senha")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-600 active:opacity-70">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Alterar Senha</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Senha Atual</p>
            <div className="relative">
              <input
                type={showAtual ? "text" : "password"}
                className={inputClass + " pr-10"}
                placeholder="••••••••"
                {...register("senhaAtual")}
              />
              <button
                type="button"
                onClick={() => setShowAtual(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.senhaAtual && <p className="text-red-600 text-xs mt-1">{errors.senhaAtual.message}</p>}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Nova Senha</p>
            <div className="relative">
              <input
                type={showNova ? "text" : "password"}
                className={inputClass + " pr-10"}
                placeholder="Mínimo 6 caracteres"
                {...register("novaSenha")}
              />
              <button
                type="button"
                onClick={() => setShowNova(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showNova ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.novaSenha && <p className="text-red-600 text-xs mt-1">{errors.novaSenha.message}</p>}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-600 mb-1">Confirmar Nova Senha</p>
            <input
              type="password"
              className={inputClass}
              placeholder="Repita a nova senha"
              {...register("confirmar")}
            />
            {errors.confirmar && <p className="text-red-600 text-xs mt-1">{errors.confirmar.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm active:opacity-80 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Alterar Senha"}
        </button>
      </form>
    </div>
  )
}

export function PerfilPage() {
  const { user, logout } = useAuth()
  const [view, setView] = useState<"perfil" | "senha">("perfil")
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  useEffect(() => {
    async function checkBiometric() {
      const available = await biometricIsAvailable()
      if (!available) return
      setBiometricAvailable(true)
      const enabled = await biometricHasCredentials()
      setBiometricEnabled(enabled)
    }
    checkBiometric()
  }, [])

  async function handleDisableBiometric() {
    await biometricDeleteCredentials()
    setBiometricEnabled(false)
    toast.success("Biometria desativada.")
  }

  if (view === "senha") {
    return <AlterarSenhaView onBack={() => setView("perfil")} />
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center py-6 space-y-3">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-sm">
          <User className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">{user?.nome}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">
            {user?.perfil}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <button
          onClick={() => setView("senha")}
          className="w-full p-4 flex items-center gap-4 active:bg-slate-50 transition-colors border-b border-slate-50"
        >
          <Shield className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-slate-700 flex-1 text-left">Segurança e Senha</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
        {biometricAvailable && (
          <button
            onClick={biometricEnabled ? handleDisableBiometric : undefined}
            className="w-full p-4 flex items-center gap-4 active:bg-slate-50 transition-colors border-b border-slate-50"
          >
            <Fingerprint className="h-5 w-5 text-indigo-500" />
            <div className="flex-1 text-left">
              <span className="font-medium text-slate-700">Login Biométrico</span>
              <p className="text-xs text-slate-400 mt-0.5">
                {biometricEnabled ? "Ativado — toque para desativar" : "Desativado — ative no próximo login"}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${biometricEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {biometricEnabled ? "ATIVO" : "INATIVO"}
            </span>
          </button>
        )}
        <button className="w-full p-4 flex items-center gap-4 active:bg-slate-50 transition-colors border-b border-slate-50">
          <Bell className="h-5 w-5 text-amber-500" />
          <span className="font-medium text-slate-700 flex-1 text-left">Notificações</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
        <button className="w-full p-4 flex items-center gap-4 active:bg-slate-50 transition-colors">
          <HelpCircle className="h-5 w-5 text-slate-500" />
          <span className="font-medium text-slate-700 flex-1 text-left">Ajuda e Suporte</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <button
        onClick={logout}
        className="w-full h-14 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        Sair do Aplicativo
      </button>

      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest pt-4">
        TransEscolar v1.0.0
      </p>
    </div>
  )
}

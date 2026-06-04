import axios from "axios"
import { toast } from "sonner"

// Para mobile, você precisará apontar para o endereço IP do seu servidor/máquina
// Exemplo: "http://192.168.1.10:5000/api"
const BASE_URL = import.meta.env.VITE_API_URL || "/api"

export const api = axios.create({
  baseURL: BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isLoginEndpoint = error.config?.url?.includes("/auth/login")
    const isAssinaturaEndpoint = error.config?.url?.includes("/assinatura/minha")

    if (status === 401 && !isLoginEndpoint) {
      localStorage.removeItem("token")
      sessionStorage.removeItem("mustChangePassword")
      window.location.href = "/login"
      return Promise.reject(error)
    }

    if (status === 402 && !isAssinaturaEndpoint) {
      const msg = error.response?.data?.error
        ?? "Sua assinatura está inadimplente. Regularize o pagamento para continuar."
      toast.error(msg, { duration: 6000, id: "assinatura-inadimplente" })
      window.location.href = "/minha-assinatura"
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

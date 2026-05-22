import axios from "axios"

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
    const isLoginEndpoint = error.config?.url?.includes("/auth/login")
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem("token")
      sessionStorage.removeItem("mustChangePassword")
      // No mobile, redirecionar via router é melhor, mas mantemos compatibilidade
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

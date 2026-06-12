import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { jwtDecode } from "jwt-decode"
import type { AuthUser, LoginRequest, LoginResponse, TipoOperacao } from "@/types/auth"
import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"

interface DecodedToken {
  sub: string
  email: string
  name: string
  [key: string]: unknown
  exp: number
}

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"

function decodeUser(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token)
    if (decoded.exp * 1000 < Date.now()) return null
    const rawRole = decoded[ROLE_CLAIM] as string
    if (!["Admin", "Motorista", "Responsavel", "SuperAdmin"].includes(rawRole)) return null
    const perfil = rawRole as AuthUser["perfil"]
    const rawTipo = decoded["tipo_operacao"] as string | undefined
    const tipoOperacao = (rawTipo === "Frota" || rawTipo === "Autonomo") ? rawTipo as TipoOperacao : undefined
    return { id: decoded.sub, email: decoded.email, nome: decoded.name, perfil, tipoOperacao }
  } catch {
    return null
  }
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<{ mustChangePassword: boolean }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem("token")
    return token ? decodeUser(token) : null
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decoded = decodeUser(token)
      if (!decoded) {
        localStorage.removeItem("token")
        sessionStorage.removeItem("mustChangePassword")
        setUser(null)
      }
    }
  }, [])

  async function login(data: LoginRequest) {
    const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", data)
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error ?? "Erro ao fazer login")
    }
    const { token, mustChangePassword } = response.data.data
    localStorage.setItem("token", token)
    localStorage.removeItem("token_superadmin")
    if (mustChangePassword) {
      sessionStorage.setItem("mustChangePassword", "true")
    }
    setUser(decodeUser(token))
    return { mustChangePassword }
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("token_superadmin")
    sessionStorage.removeItem("mustChangePassword")
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

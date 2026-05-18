import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function SuperAdminRoute() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.perfil !== "SuperAdmin") return <Navigate to="/" replace />

  return <Outlet />
}

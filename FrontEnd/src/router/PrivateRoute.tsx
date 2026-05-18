import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function PrivateRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const mustChange = sessionStorage.getItem("mustChangePassword") === "true"
  if (mustChange) {
    return <Navigate to="/alterar-senha" replace />
  }

  return <Outlet />
}

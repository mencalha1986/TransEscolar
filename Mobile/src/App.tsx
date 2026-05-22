import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { MobileLayout } from "@/components/layout/MobileLayout"
import { useAuth } from "@/contexts/AuthContext"
import { LoginPage } from "@/pages/auth/LoginPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { AlunosPage } from "@/pages/alunos/AlunosPage"
import { TransportesPage } from "@/pages/transportes/TransportesPage"
import { MensalidadesPage } from "@/pages/mensalidades/MensalidadesPage"
import { PerfilPage } from "@/pages/perfil/PerfilPage"
import { Toaster } from "sonner"

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={
          <PrivateRoute>
            <MobileLayout />
          </PrivateRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/alunos" element={<AlunosPage />} />
          <Route path="/transportes" element={<TransportesPage />} />
          <Route path="/mensalidades" element={<MensalidadesPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  )
}

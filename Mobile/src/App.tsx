import { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { MobileLayout } from "@/components/layout/MobileLayout"
import { SplashScreen } from "@/components/SplashScreen"
import { LoadingOverlay } from "@/components/LoadingOverlay"
import { useAuth } from "@/contexts/AuthContext"
import { Toaster } from "sonner"
import { usePushNotifications } from "@/hooks/usePushNotifications"

// Auth
import { LoginPage } from "@/pages/auth/LoginPage"

// Dashboard
import { DashboardPage } from "@/pages/dashboard/DashboardPage"

// Alunos
import { AlunosPage } from "@/pages/alunos/AlunosPage"
import { AlunoDetailPage } from "@/pages/alunos/AlunoDetailPage"
import { CadastrarAlunoPage } from "@/pages/alunos/CadastrarAlunoPage"
import { EditarAlunoPage } from "@/pages/alunos/EditarAlunoPage"

// Escolas
import { EscolasPage } from "@/pages/escolas/EscolasPage"

// Transportes
import { TransportesPage } from "@/pages/transportes/TransportesPage"

// Mensalidades
import { MensalidadesPage } from "@/pages/mensalidades/MensalidadesPage"

// Mural
import { MuralPage } from "@/pages/mural/MuralPage"

// Mais / Perfil
import { MaisPage } from "@/pages/mais/MaisPage"
import { PerfilPage } from "@/pages/perfil/PerfilPage"

// Responsavel
import { MaisResponsavelPage } from "@/pages/responsavel/MaisResponsavelPage"
import { MeusFilhosPage } from "@/pages/responsavel/MeusFilhosPage"
import { MensalidadesResponsavelPage } from "@/pages/responsavel/MensalidadesResponsavelPage"
import { HistoricoPage } from "@/pages/responsavel/HistoricoPage"
import { AusenciaPage } from "@/pages/responsavel/AusenciaPage"
import { ContatoTransportadorPage } from "@/pages/responsavel/ContatoTransportadorPage"

// Backoffice
import { BackofficeDashboardPage } from "@/pages/backoffice/BackofficeDashboardPage"
import { TransportadoresPage } from "@/pages/backoffice/TransportadoresPage"
import { CadastrarTransportadorPage } from "@/pages/backoffice/CadastrarTransportadorPage"
import { TransportadorDetailPage } from "@/pages/backoffice/TransportadorDetailPage"
import { PlanosPage } from "@/pages/backoffice/PlanosPage"
import { AssinaturasPage } from "@/pages/backoffice/AssinaturasPage"
import { EmailLogsPage } from "@/pages/backoffice/EmailLogsPage"

function PushNotificationInit() {
  const navigate = useNavigate()
  usePushNotifications(navigate)
  return null
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (user?.perfil !== "SuperAdmin") return <Navigate to="/dashboard" />
  return <>{children}</>
}

export function App() {
  const [splashDone, setSplashDone] = useState(false)

  return (
    <>
      {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <PrivateRoute>
              <MobileLayout />
            </PrivateRoute>
          }
        >
          {/* Transportador routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/alunos" element={<AlunosPage />} />
          <Route path="/alunos/novo" element={<CadastrarAlunoPage />} />
          <Route path="/alunos/:id" element={<AlunoDetailPage />} />
          <Route path="/alunos/:id/editar" element={<EditarAlunoPage />} />
          <Route path="/escolas" element={<EscolasPage />} />
          <Route path="/transportes" element={<TransportesPage />} />
          <Route path="/mensalidades" element={<MensalidadesPage />} />
          <Route path="/mural" element={<MuralPage />} />
          <Route path="/mais" element={<MaisPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/mais-responsavel" element={<MaisResponsavelPage />} />
          <Route path="/meus-filhos" element={<MeusFilhosPage />} />
          <Route path="/mensalidades/responsavel" element={<MensalidadesResponsavelPage />} />
          <Route path="/historico" element={<HistoricoPage />} />
          <Route path="/ausencias" element={<AusenciaPage />} />
          <Route path="/contato-transportador" element={<ContatoTransportadorPage />} />

          {/* SuperAdmin routes */}
          <Route path="/backoffice" element={<SuperAdminRoute><BackofficeDashboardPage /></SuperAdminRoute>} />
          <Route path="/backoffice/transportadores" element={<SuperAdminRoute><TransportadoresPage /></SuperAdminRoute>} />
          <Route path="/backoffice/transportadores/novo" element={<SuperAdminRoute><CadastrarTransportadorPage /></SuperAdminRoute>} />
          <Route path="/backoffice/transportadores/:id" element={<SuperAdminRoute><TransportadorDetailPage /></SuperAdminRoute>} />
          <Route path="/backoffice/planos" element={<SuperAdminRoute><PlanosPage /></SuperAdminRoute>} />
          <Route path="/backoffice/assinaturas" element={<SuperAdminRoute><AssinaturasPage /></SuperAdminRoute>} />
          <Route path="/backoffice/email-logs" element={<SuperAdminRoute><EmailLogsPage /></SuperAdminRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
      <PushNotificationInit />
      <Toaster richColors position="top-center" />
      <LoadingOverlay />
    </BrowserRouter>
    </>
  )
}

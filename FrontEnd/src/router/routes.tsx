import { createBrowserRouter, Navigate } from "react-router-dom"
import { PrivateRoute } from "./PrivateRoute"
import { SuperAdminRoute } from "./SuperAdminRoute"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { AlterarSenhaPage } from "@/pages/auth/AlterarSenhaPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { AlunosPage } from "@/pages/alunos/AlunosPage"
import { CadastrarAlunoPage } from "@/pages/alunos/CadastrarAlunoPage"
import { AlunoDetailPage } from "@/pages/alunos/AlunoDetailPage"
import { EditarAlunoPage } from "@/pages/alunos/EditarAlunoPage"
import { TransportesPage } from "@/pages/transportes/TransportesPage"
import { EscolasPage } from "@/pages/escolas/EscolasPage"
import { MensalidadesPage } from "@/pages/mensalidades/MensalidadesPage"
import { BackofficeDashboardPage } from "@/pages/backoffice/BackofficeDashboardPage"
import { TransportadoresPage } from "@/pages/backoffice/TransportadoresPage"
import { CadastrarTransportadorPage } from "@/pages/backoffice/CadastrarTransportadorPage"
import { TransportadorDetailPage } from "@/pages/backoffice/TransportadorDetailPage"
import { PlanosPage } from "@/pages/backoffice/PlanosPage"
import { AssinaturasPage } from "@/pages/backoffice/AssinaturasPage"
import { MuralPage } from "@/pages/mural/MuralPage"

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/alterar-senha",
    element: <AlterarSenhaPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/alunos", element: <AlunosPage /> },
          { path: "/alunos/novo", element: <CadastrarAlunoPage /> },
          { path: "/alunos/:id", element: <AlunoDetailPage /> },
          { path: "/alunos/:id/editar", element: <EditarAlunoPage /> },
          { path: "/escolas", element: <EscolasPage /> },
          { path: "/transportes", element: <TransportesPage /> },
          { path: "/mensalidades", element: <MensalidadesPage /> },
          { path: "/mural", element: <MuralPage /> },
        ],
      },
      {
        element: <SuperAdminRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: "/backoffice", element: <BackofficeDashboardPage /> },
              { path: "/backoffice/transportadores", element: <TransportadoresPage /> },
              { path: "/backoffice/transportadores/novo", element: <CadastrarTransportadorPage /> },
              { path: "/backoffice/transportadores/:id", element: <TransportadorDetailPage /> },
              { path: "/backoffice/planos", element: <PlanosPage /> },
              { path: "/backoffice/assinaturas", element: <AssinaturasPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])

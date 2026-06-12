import { createBrowserRouter, Navigate } from "react-router-dom"
import { PrivateRoute } from "./PrivateRoute"
import { SuperAdminRoute } from "./SuperAdminRoute"
import { AppLayout } from "@/components/layout/AppLayout"
import { LoginPage } from "@/pages/auth/LoginPage"
import { AlterarSenhaPage } from "@/pages/auth/AlterarSenhaPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { LandingPage } from "@/pages/landing/LandingPage"
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
import { EmailLogsPage } from "@/pages/backoffice/EmailLogsPage"
import { MonitoramentoPage } from "@/pages/backoffice/MonitoramentoPage"
import { MuralPage } from "@/pages/mural/MuralPage"
import { MeusFilhosPage } from "@/pages/responsavel/MeusFilhosPage"
import { MensalidadesResponsavelPage } from "@/pages/responsavel/MensalidadesResponsavelPage"
import { HistoricoPage } from "@/pages/responsavel/HistoricoPage"
import { AcompanharPage } from "@/pages/responsavel/AcompanharPage"
import { ContatoTransportadorPage } from "@/pages/responsavel/ContatoTransportadorPage"
import { AusenciaPage } from "@/pages/responsavel/AusenciaPage"
import { AssinaturaPage } from "@/pages/assinatura/AssinaturaPage"
import { MotoristasPage } from "@/pages/motoristas/MotoristasPage"
import { RotasPage } from "@/pages/rotas/RotasPage"
import { MonitorarFrotaPage } from "@/pages/frota/MonitorarFrotaPage"
import { DespesasPage } from "@/pages/financeiro/DespesasPage"
import { ResumoPage } from "@/pages/financeiro/ResumoPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
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
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/alunos", element: <AlunosPage /> },
          { path: "/alunos/novo", element: <CadastrarAlunoPage /> },
          { path: "/alunos/:id", element: <AlunoDetailPage /> },
          { path: "/alunos/:id/editar", element: <EditarAlunoPage /> },
          { path: "/escolas", element: <EscolasPage /> },
          { path: "/transportes", element: <TransportesPage /> },
          { path: "/mensalidades", element: <MensalidadesPage /> },
          { path: "/mural", element: <MuralPage /> },
          { path: "/minha-assinatura", element: <AssinaturaPage /> },
          { path: "/motoristas", element: <MotoristasPage /> },
          { path: "/rotas", element: <RotasPage /> },
          { path: "/frota/monitorar", element: <MonitorarFrotaPage /> },
          { path: "/financeiro/despesas", element: <DespesasPage /> },
          { path: "/financeiro/resumo", element: <ResumoPage /> },
          { path: "/meus-filhos", element: <MeusFilhosPage /> },
          { path: "/mensalidades/responsavel", element: <MensalidadesResponsavelPage /> },
          { path: "/historico", element: <HistoricoPage /> },
          { path: "/acompanhar", element: <AcompanharPage /> },
          { path: "/contato-transportador", element: <ContatoTransportadorPage /> },
          { path: "/ausencias", element: <AusenciaPage /> },
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
              { path: "/backoffice/email-logs", element: <EmailLogsPage /> },
              { path: "/backoffice/monitoramento", element: <MonitoramentoPage /> },
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

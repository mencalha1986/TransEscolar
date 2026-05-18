using MediatR;

namespace TransporteEscolar.Application.Backoffice.Dashboard.Queries.ObterDashboard;

public record DashboardDto(
    int TotalTransportadores,
    int TransportadoresAtivos,
    int Inadimplentes,
    int TotalAlunos,
    decimal ReceitaMensal
);

public record ObterDashboardQuery : IRequest<DashboardDto>;

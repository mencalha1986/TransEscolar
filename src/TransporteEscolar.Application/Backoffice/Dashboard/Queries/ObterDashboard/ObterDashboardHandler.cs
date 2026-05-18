using MediatR;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Dashboard.Queries.ObterDashboard;

public class ObterDashboardHandler : IRequestHandler<ObterDashboardQuery, DashboardDto>
{
    private readonly ITransportadorRepository _transportadorRepo;
    private readonly IAssinaturaRepository _assinaturaRepo;

    public ObterDashboardHandler(ITransportadorRepository transportadorRepo, IAssinaturaRepository assinaturaRepo)
        => (_transportadorRepo, _assinaturaRepo) = (transportadorRepo, assinaturaRepo);

    public async Task<DashboardDto> Handle(ObterDashboardQuery request, CancellationToken ct)
    {
        var transportadores = (await _transportadorRepo.ListarTodosAsync(ct)).ToList();
        var assinaturas = (await _assinaturaRepo.ListarTodasAsync(ct)).ToList();

        var total = transportadores.Count;
        var ativos = transportadores.Count(t => t.Status == StatusTransportador.Ativo);
        var inadimplentes = assinaturas.Count(a => a.Status == StatusAssinatura.Inadimplente);
        var receitaMensal = assinaturas
            .Where(a => a.Status == StatusAssinatura.Ativa)
            .Sum(a => a.ValorContratado);

        var totalAlunos = 0;
        foreach (var t in transportadores)
            totalAlunos += await _transportadorRepo.ContarAlunosAsync(t.Id, ct);

        return new DashboardDto(total, ativos, inadimplentes, totalAlunos, receitaMensal);
    }
}

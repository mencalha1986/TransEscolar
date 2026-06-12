using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Financeiro.Queries.ResumoFinanceiro;

public class ResumoFinanceiroHandler : IRequestHandler<ResumoFinanceiroQuery, ResumoFinanceiroDto>
{
    private readonly ILancamentoFinanceiroRepository _repo;
    private readonly ITransporteRepository _transporteRepo;
    private readonly ICurrentTenantService _tenant;

    public ResumoFinanceiroHandler(ILancamentoFinanceiroRepository repo, ITransporteRepository transporteRepo, ICurrentTenantService tenant)
        => (_repo, _transporteRepo, _tenant) = (repo, transporteRepo, tenant);

    public async Task<ResumoFinanceiroDto> Handle(ResumoFinanceiroQuery request, CancellationToken ct)
    {
        var tenantId = _tenant.TenantId!.Value;

        var lancamentos = await _repo.ListarPorTransportadorAsync(
            tenantId, request.DataInicio, request.DataFim, null, null, ct);

        var lista = lancamentos.ToList();

        var totalPorTipo = lista
            .GroupBy(l => l.Tipo.ToString())
            .ToDictionary(g => g.Key, g => g.Sum(l => l.Valor));

        var transporteIds = lista
            .Where(l => l.TransporteId.HasValue)
            .Select(l => l.TransporteId!.Value)
            .Distinct()
            .ToHashSet();

        var transportes = new Dictionary<Guid, string>();
        if (transporteIds.Count > 0)
        {
            var todos = await _transporteRepo.ListarTodosAsync(ct);
            foreach (var t in todos.Where(t => transporteIds.Contains(t.Id)))
                transportes[t.Id] = t.Placa;
        }

        var totalPorVeiculo = lista
            .Where(l => l.TransporteId.HasValue)
            .GroupBy(l => transportes.GetValueOrDefault(l.TransporteId!.Value, l.TransporteId!.Value.ToString()))
            .ToDictionary(g => g.Key, g => g.Sum(l => l.Valor));

        return new ResumoFinanceiroDto(
            lista.Sum(l => l.Valor),
            totalPorTipo,
            totalPorVeiculo);
    }
}

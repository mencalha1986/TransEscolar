using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Financeiro.Queries.ListarDespesas;

public class ListarDespesasHandler : IRequestHandler<ListarDespesasQuery, IEnumerable<LancamentoFinanceiroDto>>
{
    private readonly ILancamentoFinanceiroRepository _repo;
    private readonly ITransporteRepository _transporteRepo;
    private readonly ICurrentTenantService _tenant;

    public ListarDespesasHandler(ILancamentoFinanceiroRepository repo, ITransporteRepository transporteRepo, ICurrentTenantService tenant)
        => (_repo, _transporteRepo, _tenant) = (repo, transporteRepo, tenant);

    public async Task<IEnumerable<LancamentoFinanceiroDto>> Handle(ListarDespesasQuery request, CancellationToken ct)
    {
        var tenantId = _tenant.IsSuperAdmin ? Guid.Empty : _tenant.TenantId!.Value;

        var lancamentos = await _repo.ListarPorTransportadorAsync(
            tenantId, request.DataInicio, request.DataFim, request.Tipo, request.TransporteId, ct);

        var transporteIds = lancamentos
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

        return lancamentos.Select(l => new LancamentoFinanceiroDto(
            l.Id,
            l.Tipo,
            l.Tipo.ToString(),
            l.Descricao,
            l.Valor,
            l.DataLancamento,
            l.TransporteId,
            l.TransporteId.HasValue ? transportes.GetValueOrDefault(l.TransporteId.Value) : null,
            l.Observacao,
            l.CriadoEm));
    }
}

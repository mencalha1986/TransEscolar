using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Transportes.Queries.ListarTransportes;

public class ListarTransportesHandler : IRequestHandler<ListarTransportesQuery, Result<IEnumerable<TransporteResumoDto>>>
{
    private readonly ITransporteRepository _repo;
    private readonly ICurrentTenantService _tenant;

    public ListarTransportesHandler(ITransporteRepository repo, ICurrentTenantService tenant)
        => (_repo, _tenant) = (repo, tenant);

    public async Task<Result<IEnumerable<TransporteResumoDto>>> Handle(ListarTransportesQuery request, CancellationToken ct)
    {
        var all = await _repo.ListarTodosAsync(ct);
        var transportes = _tenant.TenantId.HasValue
            ? all.Where(t => t.TransportadorId == _tenant.TenantId.Value)
            : all;
        var dtos = transportes.Select(t => new TransporteResumoDto(t.Id, t.Placa, t.NomeMotorista, t.CapacidadeMaxima, t.Status.ToString()));
        return Result<IEnumerable<TransporteResumoDto>>.Success(dtos);
    }
}

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Viagens.Queries.ObterViagemAtual;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Queries.ListarViagens;

public class ListarViagensHandler : IRequestHandler<ListarViagensQuery, Result<IEnumerable<ViagemDto>>>
{
    private readonly IViagemRepository _repo;
    private readonly ICurrentTenantService _tenant;

    public ListarViagensHandler(IViagemRepository repo, ICurrentTenantService tenant)
        => (_repo, _tenant) = (repo, tenant);

    public async Task<Result<IEnumerable<ViagemDto>>> Handle(ListarViagensQuery request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<IEnumerable<ViagemDto>>.Failure("Usuário sem transportador associado.");

        var data = request.Data ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var viagens = await _repo.ListarPorDataAsync(data, _tenant.TenantId.Value, ct);

        var dtos = viagens.Select(v => new ViagemDto(
            v.Id,
            v.Turno.ToString(),
            v.Data,
            v.Status.ToString(),
            v.LatitudeAtual,
            v.LongitudeAtual,
            v.IniciadaEm,
            v.ConcluidaEm));

        return Result<IEnumerable<ViagemDto>>.Success(dtos);
    }
}

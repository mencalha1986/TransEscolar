using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Queries.ObterViagemAtual;

public class ObterViagemAtualHandler : IRequestHandler<ObterViagemAtualQuery, Result<ViagemDto?>>
{
    private readonly IViagemRepository _repo;
    private readonly ICurrentTenantService _tenant;

    public ObterViagemAtualHandler(IViagemRepository repo, ICurrentTenantService tenant)
        => (_repo, _tenant) = (repo, tenant);

    public async Task<Result<ViagemDto?>> Handle(ObterViagemAtualQuery request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<ViagemDto?>.Failure("Usuário sem transportador associado.");

        var viagem = await _repo.ObterEmRotaAsync(_tenant.TenantId.Value, ct);
        if (viagem == null)
            return Result<ViagemDto?>.Success(null);

        var dto = new ViagemDto(
            viagem.Id,
            viagem.Turno.ToString(),
            viagem.Data,
            viagem.Status.ToString(),
            viagem.LatitudeAtual,
            viagem.LongitudeAtual,
            viagem.IniciadaEm,
            viagem.ConcluidaEm);

        return Result<ViagemDto?>.Success(dto);
    }
}

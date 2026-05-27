using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Queries.ObterPercursoViagem;

public class ObterPercursoViagemHandler : IRequestHandler<ObterPercursoViagemQuery, Result<IEnumerable<PercursoPontoDto>>>
{
    private readonly IViagemPercursoRepository _repo;
    private readonly IViagemRepository _viagemRepo;
    private readonly ICurrentTenantService _tenant;

    public ObterPercursoViagemHandler(IViagemPercursoRepository repo, IViagemRepository viagemRepo, ICurrentTenantService tenant)
        => (_repo, _viagemRepo, _tenant) = (repo, viagemRepo, tenant);

    public async Task<Result<IEnumerable<PercursoPontoDto>>> Handle(ObterPercursoViagemQuery request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<IEnumerable<PercursoPontoDto>>.Failure("Usuário sem transportador associado.");

        // Valida que a viagem pertence ao tenant
        var viagem = await _viagemRepo.ObterPorIdAsync(request.ViagemId, ct);
        if (viagem == null)
            return Result<IEnumerable<PercursoPontoDto>>.Failure("Viagem não encontrada.");

        var pontos = await _repo.ListarPorViagemAsync(request.ViagemId, ct);
        var dtos = pontos.Select(p => new PercursoPontoDto(p.Latitude, p.Longitude, p.Timestamp));

        return Result<IEnumerable<PercursoPontoDto>>.Success(dtos);
    }
}

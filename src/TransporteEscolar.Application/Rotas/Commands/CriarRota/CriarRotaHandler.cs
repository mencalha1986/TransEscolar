using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Rotas.Commands.CriarRota;

public class CriarRotaHandler : IRequestHandler<CriarRotaCommand, Result<Guid>>
{
    private readonly IRotaRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public CriarRotaHandler(IRotaRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<Guid>> Handle(CriarRotaCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<Guid>.Failure("Tenant não identificado.");

        var result = Rota.Criar(request.Nome, request.Turno, transportadorId, request.MotoristaId, request.TransporteId);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }
}

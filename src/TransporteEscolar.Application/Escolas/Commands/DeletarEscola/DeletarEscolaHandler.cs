using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Escolas.Commands.DeletarEscola;

public class DeletarEscolaHandler : IRequestHandler<DeletarEscolaCommand, Result<bool>>
{
    private readonly IEscolaRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public DeletarEscolaHandler(IEscolaRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<bool>> Handle(DeletarEscolaCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<bool>.Failure("Tenant não identificado.");

        var escola = await _repo.ObterPorIdAsync(request.Id, ct);
        if (escola is null)
            return Result<bool>.Failure("Escola não encontrada.");

        if (escola.TransportadorId != transportadorId)
            return Result<bool>.Failure("Escola não pertence ao transportador.");

        _repo.Remover(escola);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

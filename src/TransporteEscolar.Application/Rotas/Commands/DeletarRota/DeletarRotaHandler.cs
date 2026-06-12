using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Rotas.Commands.DeletarRota;

public class DeletarRotaHandler : IRequestHandler<DeletarRotaCommand, Result<bool>>
{
    private readonly IRotaRepository _repo;
    private readonly IUnitOfWork _uow;

    public DeletarRotaHandler(IRotaRepository repo, IUnitOfWork uow) => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(DeletarRotaCommand request, CancellationToken ct)
    {
        var rota = await _repo.ObterPorIdAsync(request.Id, ct);
        if (rota is null) return Result<bool>.Failure("Rota não encontrada.");

        _repo.Remover(rota);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

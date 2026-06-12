using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Rotas.Commands.EditarRota;

public class EditarRotaHandler : IRequestHandler<EditarRotaCommand, Result<bool>>
{
    private readonly IRotaRepository _repo;
    private readonly IUnitOfWork _uow;

    public EditarRotaHandler(IRotaRepository repo, IUnitOfWork uow) => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(EditarRotaCommand request, CancellationToken ct)
    {
        var rota = await _repo.ObterPorIdAsync(request.Id, ct);
        if (rota is null) return Result<bool>.Failure("Rota não encontrada.");

        rota.Atualizar(request.Nome, request.Turno, request.MotoristaId, request.TransporteId);
        _repo.Atualizar(rota);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

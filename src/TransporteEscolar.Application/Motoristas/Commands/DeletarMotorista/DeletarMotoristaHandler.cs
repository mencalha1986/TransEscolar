using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Motoristas.Commands.DeletarMotorista;

public class DeletarMotoristaHandler : IRequestHandler<DeletarMotoristaCommand, Result<bool>>
{
    private readonly IMotoristaRepository _repo;
    private readonly IUnitOfWork _uow;

    public DeletarMotoristaHandler(IMotoristaRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(DeletarMotoristaCommand request, CancellationToken ct)
    {
        var motorista = await _repo.ObterPorIdAsync(request.Id, ct);
        if (motorista is null)
            return Result<bool>.Failure("Motorista não encontrado.");

        _repo.Remover(motorista);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

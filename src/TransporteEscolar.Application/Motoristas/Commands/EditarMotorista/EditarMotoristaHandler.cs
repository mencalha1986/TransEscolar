using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Motoristas.Commands.EditarMotorista;

public class EditarMotoristaHandler : IRequestHandler<EditarMotoristaCommand, Result<bool>>
{
    private readonly IMotoristaRepository _repo;
    private readonly IUnitOfWork _uow;

    public EditarMotoristaHandler(IMotoristaRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(EditarMotoristaCommand request, CancellationToken ct)
    {
        var motorista = await _repo.ObterPorIdAsync(request.Id, ct);
        if (motorista is null)
            return Result<bool>.Failure("Motorista não encontrado.");

        motorista.Atualizar(request.Nome, request.Cnh, request.Telefone);
        _repo.Atualizar(motorista);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

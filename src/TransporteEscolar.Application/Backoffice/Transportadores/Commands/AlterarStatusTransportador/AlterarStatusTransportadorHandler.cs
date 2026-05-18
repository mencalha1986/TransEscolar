using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.AlterarStatusTransportador;

public class AlterarStatusTransportadorHandler : IRequestHandler<AlterarStatusTransportadorCommand, Result<bool>>
{
    private readonly ITransportadorRepository _repo;
    private readonly IUnitOfWork _uow;

    public AlterarStatusTransportadorHandler(ITransportadorRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(AlterarStatusTransportadorCommand request, CancellationToken ct)
    {
        var transportador = await _repo.ObterPorIdAsync(request.TransportadorId, ct);
        if (transportador is null)
            return Result<bool>.Failure("Transportador não encontrado.");

        transportador.AlterarStatus(request.Status);
        _repo.Atualizar(transportador);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

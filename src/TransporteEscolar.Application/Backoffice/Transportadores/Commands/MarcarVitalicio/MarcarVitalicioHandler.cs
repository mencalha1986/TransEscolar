using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.MarcarVitalicio;

public class MarcarVitalicioHandler : IRequestHandler<MarcarVitalicioCommand, Result<bool>>
{
    private readonly ITransportadorRepository _repo;
    private readonly IUnitOfWork _uow;

    public MarcarVitalicioHandler(ITransportadorRepository repo, IUnitOfWork uow) => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(MarcarVitalicioCommand request, CancellationToken ct)
    {
        var transportador = await _repo.ObterPorIdAsync(request.TransportadorId, ct);
        if (transportador is null)
            return Result<bool>.Failure("Transportador não encontrado.");

        if (request.Vitalicio)
            transportador.MarcarVitalicio();
        else
            transportador.RevogarVitalicio();

        await _uow.CommitAsync(ct);
        return Result<bool>.Success(true);
    }
}

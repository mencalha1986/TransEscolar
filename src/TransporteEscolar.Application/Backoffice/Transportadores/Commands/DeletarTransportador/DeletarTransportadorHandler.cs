using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.DeletarTransportador;

public class DeletarTransportadorHandler : IRequestHandler<DeletarTransportadorCommand, Result<bool>>
{
    private readonly ITransportadorRepository _repo;

    public DeletarTransportadorHandler(ITransportadorRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(DeletarTransportadorCommand request, CancellationToken ct)
    {
        var transportador = await _repo.ObterPorIdAsync(request.Id, ct);
        if (transportador is null)
            return Result<bool>.Failure("Transportador não encontrado.");

        await _repo.DeletarEmCascataAsync(request.Id, ct);

        return Result<bool>.Success(true);
    }
}

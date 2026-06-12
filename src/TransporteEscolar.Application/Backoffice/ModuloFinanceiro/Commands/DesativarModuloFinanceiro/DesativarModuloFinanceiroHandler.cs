using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.ModuloFinanceiro.Commands.DesativarModuloFinanceiro;

public class DesativarModuloFinanceiroHandler : IRequestHandler<DesativarModuloFinanceiroCommand, Result<bool>>
{
    private readonly ITransportadorRepository _repo;
    private readonly IUnitOfWork _uow;

    public DesativarModuloFinanceiroHandler(ITransportadorRepository repo, IUnitOfWork uow)
        => (_repo, _uow) = (repo, uow);

    public async Task<Result<bool>> Handle(DesativarModuloFinanceiroCommand request, CancellationToken ct)
    {
        var transportador = await _repo.ObterPorIdAsync(request.TransportadorId, ct);
        if (transportador is null)
            return Result<bool>.Failure("Transportador não encontrado.");

        transportador.DesativarModuloFinanceiro();
        _repo.Atualizar(transportador);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

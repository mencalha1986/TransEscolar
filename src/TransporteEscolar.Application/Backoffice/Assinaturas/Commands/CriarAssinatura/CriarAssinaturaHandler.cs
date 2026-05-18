using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Commands.CriarAssinatura;

public class CriarAssinaturaHandler : IRequestHandler<CriarAssinaturaCommand, Result<Guid>>
{
    private readonly IAssinaturaRepository _repo;
    private readonly ITransportadorRepository _transportadorRepo;
    private readonly IUnitOfWork _uow;

    public CriarAssinaturaHandler(IAssinaturaRepository repo, ITransportadorRepository transportadorRepo, IUnitOfWork uow)
        => (_repo, _transportadorRepo, _uow) = (repo, transportadorRepo, uow);

    public async Task<Result<Guid>> Handle(CriarAssinaturaCommand request, CancellationToken ct)
    {
        var transportador = await _transportadorRepo.ObterPorIdAsync(request.TransportadorId, ct);
        if (transportador is null)
            return Result<Guid>.Failure("Transportador não encontrado.");

        var result = Assinatura.Criar(request.TransportadorId, request.PlanoId, request.ValorContratado, DateTime.UtcNow);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        transportador.AssociarPlano(request.PlanoId);
        _transportadorRepo.Atualizar(transportador);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }
}

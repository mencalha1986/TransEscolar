using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Queries.ObterMinhaAssinatura;

public record MinhaAssinaturaDto(
    Guid Id,
    StatusAssinatura Status,
    string NomePlano,
    decimal ValorContratado,
    DateTime DataProximoVencimento,
    bool TemPixPendente,
    DateTime? PixExpiresAt);

public record ObterMinhaAssinaturaQuery(Guid TransportadorId) : IRequest<Result<MinhaAssinaturaDto>>;

public class ObterMinhaAssinaturaHandler : IRequestHandler<ObterMinhaAssinaturaQuery, Result<MinhaAssinaturaDto>>
{
    private readonly IAssinaturaRepository _repo;
    private readonly IPlanoRepository _planoRepo;

    public ObterMinhaAssinaturaHandler(IAssinaturaRepository repo, IPlanoRepository planoRepo)
        => (_repo, _planoRepo) = (repo, planoRepo);

    public async Task<Result<MinhaAssinaturaDto>> Handle(ObterMinhaAssinaturaQuery request, CancellationToken ct)
    {
        var assinatura = await _repo.ObterPorTransportadorAsync(request.TransportadorId, ct);
        if (assinatura is null)
            return Result<MinhaAssinaturaDto>.Failure("Nenhuma assinatura encontrada.");

        var plano = await _planoRepo.ObterPorIdAsync(assinatura.PlanoId, ct);
        var nomePlano = plano?.Nome ?? "—";

        var temPixPendente = assinatura.PixCobrancaId is not null &&
                             assinatura.PixExpiresAt.HasValue &&
                             assinatura.PixExpiresAt.Value > DateTime.UtcNow;

        return Result<MinhaAssinaturaDto>.Success(new MinhaAssinaturaDto(
            assinatura.Id,
            assinatura.Status,
            nomePlano,
            assinatura.ValorContratado,
            assinatura.DataProximoVencimento,
            temPixPendente,
            assinatura.PixExpiresAt));
    }
}

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Mensalidades.Commands.GerarPix;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Commands.GerarPixAssinatura;

public class GerarPixAssinaturaHandler : IRequestHandler<GerarPixAssinaturaCommand, Result<PixDto>>
{
    private readonly IAssinaturaRepository _repo;
    private readonly IPixService _pix;
    private readonly IUnitOfWork _uow;

    public GerarPixAssinaturaHandler(IAssinaturaRepository repo, IPixService pix, IUnitOfWork uow)
        => (_repo, _pix, _uow) = (repo, pix, uow);

    public async Task<Result<PixDto>> Handle(GerarPixAssinaturaCommand request, CancellationToken ct)
    {
        var assinatura = await _repo.ObterPorTransportadorAsync(request.TransportadorId, ct);
        if (assinatura is null)
            return Result<PixDto>.Failure("Assinatura não encontrada para este transportador.");

        if (assinatura.Status == StatusAssinatura.Cancelada)
            return Result<PixDto>.Failure("Assinatura cancelada.");

        // Reutiliza cobrança existente se ainda não expirou
        if (assinatura.PixCobrancaId is not null &&
            assinatura.PixExpiresAt.HasValue &&
            assinatura.PixExpiresAt.Value > DateTime.UtcNow.AddMinutes(5))
        {
            return Result<PixDto>.Success(new PixDto(
                assinatura.PixBrCode!,
                assinatura.PixBrCodeBase64!,
                assinatura.PixExpiresAt.Value));
        }

        var competencia = assinatura.DataProximoVencimento;
        var descricao = $"Assinatura TransEscolar — {competencia:MM/yyyy}";

        try
        {
            var cobranca = await _pix.CriarCobrancaAsync(
                assinatura.ValorContratado, descricao,
                tipo: "assinatura", referenciaId: assinatura.Id,
                expiresInSeconds: 86400, ct: ct); // 24h

            assinatura.RegistrarPix(cobranca.Id, cobranca.BrCode, cobranca.BrCodeBase64, cobranca.ExpiresAt);
            await _uow.CommitAsync(ct);

            return Result<PixDto>.Success(new PixDto(cobranca.BrCode, cobranca.BrCodeBase64, cobranca.ExpiresAt));
        }
        catch (Exception ex)
        {
            return Result<PixDto>.Failure($"Erro ao gerar cobrança PIX: {ex.Message}");
        }
    }
}

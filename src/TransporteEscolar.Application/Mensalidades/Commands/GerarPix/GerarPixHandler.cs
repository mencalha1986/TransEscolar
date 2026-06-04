using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Mensalidades.Commands.GerarPix;

public class GerarPixHandler : IRequestHandler<GerarPixCommand, Result<PixDto>>
{
    private readonly IMensalidadeRepository _repo;
    private readonly IPixService _pix;
    private readonly IUnitOfWork _uow;

    public GerarPixHandler(IMensalidadeRepository repo, IPixService pix, IUnitOfWork uow)
        => (_repo, _pix, _uow) = (repo, pix, uow);

    public async Task<Result<PixDto>> Handle(GerarPixCommand request, CancellationToken ct)
    {
        var mensalidade = await _repo.ObterPorIdAsync(request.MensalidadeId, ct);
        if (mensalidade is null)
            return Result<PixDto>.Failure("Mensalidade não encontrada.");

        if (mensalidade.Status == StatusMensalidade.Pago)
            return Result<PixDto>.Failure("Mensalidade já está paga.");

        // Reutiliza cobrança existente se ainda não expirou
        if (mensalidade.PixCobrancaId is not null &&
            mensalidade.PixExpiresAt.HasValue &&
            mensalidade.PixExpiresAt.Value > DateTime.UtcNow.AddMinutes(5))
        {
            return Result<PixDto>.Success(new PixDto(
                mensalidade.PixBrCode!,
                mensalidade.PixBrCodeBase64!,
                mensalidade.PixExpiresAt.Value));
        }

        var descricao = $"Mensalidade {mensalidade.Competencia:MM/yyyy}";

        try
        {
            var cobranca = await _pix.CriarCobrancaAsync(
                mensalidade.Valor, descricao,
                tipo: "mensalidade", referenciaId: mensalidade.Id,
                expiresInSeconds: 3600, ct: ct);

            mensalidade.RegistrarPix(cobranca.Id, cobranca.BrCode, cobranca.BrCodeBase64, cobranca.ExpiresAt);
            await _uow.CommitAsync(ct);

            return Result<PixDto>.Success(new PixDto(cobranca.BrCode, cobranca.BrCodeBase64, cobranca.ExpiresAt));
        }
        catch (Exception ex)
        {
            return Result<PixDto>.Failure($"Erro ao gerar cobrança PIX: {ex.Message}");
        }
    }
}

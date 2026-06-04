namespace TransporteEscolar.Domain.Interfaces;

public record PixCobrancaResult(string Id, string BrCode, string BrCodeBase64, DateTime ExpiresAt);

public interface IPixService
{
    Task<PixCobrancaResult> CriarCobrancaAsync(
        decimal valor,
        string descricao,
        string tipo,
        Guid referenciaId,
        int expiresInSeconds = 3600,
        CancellationToken ct = default);
}

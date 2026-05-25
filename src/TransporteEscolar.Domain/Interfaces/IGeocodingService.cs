namespace TransporteEscolar.Domain.Interfaces;

public interface IGeocodingService
{
    Task<string?> ResolverEnderecoAsync(double latitude, double longitude, CancellationToken ct = default);
}

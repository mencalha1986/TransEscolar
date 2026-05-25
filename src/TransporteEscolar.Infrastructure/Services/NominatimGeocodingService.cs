using System.Text.Json;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.Services;

public class NominatimGeocodingService : IGeocodingService
{
    private readonly HttpClient _http;
    private readonly ILogger<NominatimGeocodingService> _logger;

    public NominatimGeocodingService(HttpClient http, ILogger<NominatimGeocodingService> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<string?> ResolverEnderecoAsync(double latitude, double longitude, CancellationToken ct = default)
    {
        try
        {
            var url = $"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude.ToString(System.Globalization.CultureInfo.InvariantCulture)}&lon={longitude.ToString(System.Globalization.CultureInfo.InvariantCulture)}";
            var response = await _http.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync(ct);
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.TryGetProperty("display_name", out var displayName))
                return displayName.GetString();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao resolver endereço para lat={Lat} lon={Lon}", latitude, longitude);
        }
        return null;
    }
}

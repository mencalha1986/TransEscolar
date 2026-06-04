using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.Services;

public class AbacatePayService : IPixService
{
    private readonly HttpClient _http;
    private readonly ILogger<AbacatePayService> _logger;
    private readonly string _apiKey;

    private const string BaseUrl = "https://api.abacatepay.com/v2";

    public AbacatePayService(HttpClient http, IConfiguration config, ILogger<AbacatePayService> logger)
    {
        _http = http;
        _logger = logger;
        _apiKey = config["AbacatePay:ApiKey"] ?? throw new InvalidOperationException("AbacatePay:ApiKey não configurado.");
    }

    public async Task<PixCobrancaResult> CriarCobrancaAsync(
        decimal valor,
        string descricao,
        string tipo,
        Guid referenciaId,
        int expiresInSeconds = 3600,
        CancellationToken ct = default)
    {
        var amountInCents = (int)Math.Round(valor * 100);

        var body = new
        {
            method = "PIX",
            data = new
            {
                amount = amountInCents,
                description = descricao,
                expiresIn = expiresInSeconds,
                metadata = new { tipo, referenciaId = referenciaId.ToString() }
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/transparents/create");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = JsonContent.Create(body);

        var response = await _http.SendAsync(request, ct);
        var content = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("AbacatePay erro {Status}: {Body}", (int)response.StatusCode, content);
            throw new InvalidOperationException($"Erro ao criar cobrança PIX: {(int)response.StatusCode}");
        }

        var result = await response.Content.ReadFromJsonAsync<AbacatePayResponse>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Resposta inválida do AbacatePay.");

        if (!result.Success || result.Data is null)
            throw new InvalidOperationException(result.Error ?? "Erro desconhecido ao criar cobrança PIX.");

        return new PixCobrancaResult(
            result.Data.Id,
            result.Data.BrCode,
            result.Data.BrCodeBase64,
            result.Data.ExpiresAt);
    }

    private sealed class AbacatePayResponse
    {
        [JsonPropertyName("success")] public bool Success { get; set; }
        [JsonPropertyName("error")] public string? Error { get; set; }
        [JsonPropertyName("data")] public AbacatePayData? Data { get; set; }
    }

    private sealed class AbacatePayData
    {
        [JsonPropertyName("id")] public string Id { get; set; } = "";
        [JsonPropertyName("brCode")] public string BrCode { get; set; } = "";
        [JsonPropertyName("brCodeBase64")] public string BrCodeBase64 { get; set; } = "";
        [JsonPropertyName("expiresAt")] public DateTime ExpiresAt { get; set; }
        [JsonPropertyName("status")] public string Status { get; set; } = "";
    }
}

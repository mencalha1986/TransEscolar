using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using TransporteEscolar.Application.Backoffice.Assinaturas.Commands.ConfirmarPagamentoPixAssinatura;
using TransporteEscolar.Application.Mensalidades.Commands.ConfirmarPagamentoPix;

namespace TransporteEscolar.API.Controllers;

[AllowAnonymous]
[Route("api/webhooks")]
[ApiController]
public class WebhooksController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly string _webhookSecret;

    public WebhooksController(IMediator mediator, IConfiguration config)
    {
        _mediator = mediator;
        _webhookSecret = config["AbacatePay:WebhookSecret"]
            ?? throw new InvalidOperationException("AbacatePay:WebhookSecret não configurado.");
    }

    [HttpPost("pix")]
    public async Task<IActionResult> Pix(CancellationToken ct)
    {
        // Lê o body como string para validar assinatura
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true);
        var rawBody = await reader.ReadToEndAsync(ct);
        Request.Body.Position = 0;

        // Valida assinatura HMAC-SHA256
        if (!Request.Headers.TryGetValue("X-Webhook-Signature", out var signatureHeader))
            return BadRequest("Assinatura ausente.");

        if (!ValidarAssinatura(rawBody, signatureHeader!, _webhookSecret))
            return Unauthorized("Assinatura inválida.");

        var payload = JsonSerializer.Deserialize<AbacatePayWebhookPayload>(rawBody);
        if (payload is null)
            return BadRequest("Payload inválido.");

        if (payload.Event == "checkout.completed" && !string.IsNullOrEmpty(payload.Data?.Id))
        {
            var tipo = payload.Data.Metadata?.Tipo;
            if (tipo == "assinatura")
                await _mediator.Send(new ConfirmarPagamentoPixAssinaturaCommand(payload.Data.Id), ct);
            else
                await _mediator.Send(new ConfirmarPagamentoPixCommand(payload.Data.Id), ct);
        }

        // Sempre retorna 200 — AbacatePay faz retry se não receber 200
        return Ok();
    }

    private static bool ValidarAssinatura(string rawBody, string signature, string secret)
    {
        try
        {
            var bodyBytes = Encoding.UTF8.GetBytes(rawBody);
            var expectedSig = Convert.ToBase64String(
                HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), bodyBytes));

            var a = Encoding.UTF8.GetBytes(expectedSig);
            var b = Encoding.UTF8.GetBytes(signature);
            return a.Length == b.Length && CryptographicOperations.FixedTimeEquals(a, b);
        }
        catch
        {
            return false;
        }
    }

    private sealed class AbacatePayWebhookPayload
    {
        [JsonPropertyName("event")] public string Event { get; set; } = "";
        [JsonPropertyName("data")] public AbacatePayWebhookData? Data { get; set; }
    }

    private sealed class AbacatePayWebhookData
    {
        [JsonPropertyName("id")] public string Id { get; set; } = "";
        [JsonPropertyName("metadata")] public AbacatePayWebhookMetadata? Metadata { get; set; }
    }

    private sealed class AbacatePayWebhookMetadata
    {
        [JsonPropertyName("tipo")] public string? Tipo { get; set; }
    }
}

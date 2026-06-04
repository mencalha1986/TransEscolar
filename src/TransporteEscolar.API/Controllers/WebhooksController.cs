using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.Application.Backoffice.Assinaturas.Commands.ConfirmarPagamentoPixAssinatura;
using TransporteEscolar.Application.Mensalidades.Commands.ConfirmarPagamentoPix;

namespace TransporteEscolar.API.Controllers;

[AllowAnonymous]
[Route("api/webhooks")]
[ApiController]
public class WebhooksController : ControllerBase
{
    // Chave pública do AbacatePay para validação HMAC-SHA256
    private const string AbacatePayPublicKey =
        "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4" +
        "L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4" +
        "IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdi" +
        "DkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

    private readonly IMediator _mediator;

    public WebhooksController(IMediator mediator) => _mediator = mediator;

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

        if (!ValidarAssinatura(rawBody, signatureHeader!))
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

    private static bool ValidarAssinatura(string rawBody, string signature)
    {
        try
        {
            var bodyBytes = Encoding.UTF8.GetBytes(rawBody);
            var expectedSig = Convert.ToBase64String(
                HMACSHA256.HashData(Encoding.UTF8.GetBytes(AbacatePayPublicKey), bodyBytes));

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

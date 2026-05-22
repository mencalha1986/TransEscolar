using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpFactory;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, IHttpClientFactory httpFactory, ILogger<EmailService> logger)
    {
        _config = config;
        _httpFactory = httpFactory;
        _logger = logger;
    }

    public async Task EnviarAcessoResponsavelAsync(string email, string nome, string senha, CancellationToken ct = default)
    {
        var apiKey = _config["Email:ApiKey"]!;
        var from = _config["Email:From"]!;
        var fromName = _config["Email:FromName"] ?? "TransporteEscolar";

        var payload = new
        {
            sender = new { name = fromName, email = from },
            to = new[] { new { email, name = nome } },
            subject = "Acesso ao Sistema de Transporte Escolar",
            htmlContent = $"""
                <h2>Olá, {nome}!</h2>
                <p>Seu acesso ao sistema de Transporte Escolar foi criado.</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Senha temporária:</strong> {senha}</p>
                <p>Ao acessar o sistema pela primeira vez, você será solicitado a criar uma nova senha.</p>
                <br/>
                <p>Atenciosamente,<br/>Equipe TransporteEscolar</p>
                """
        };

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));

            using var client = _httpFactory.CreateClient("brevo");
            using var req = new HttpRequestMessage(HttpMethod.Post, "v3/smtp/email");
            req.Headers.Add("api-key", apiKey);
            req.Content = JsonContent.Create(payload);

            var response = await client.SendAsync(req, cts.Token);
            response.EnsureSuccessStatusCode();
            _logger.LogInformation("Email de acesso enviado para {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao enviar email de acesso para {Email} via Brevo API from {From}", email, from);
            throw;
        }
    }

    public async Task EnviarContatoAsync(string nome, string email, string telefone, string mensagem, CancellationToken ct = default)
    {
        var apiKey = _config["Email:ApiKey"]!;
        var from = _config["Email:From"]!;
        var fromName = _config["Email:FromName"] ?? "TransEscolar";

        var payload = new
        {
            sender = new { name = fromName, email = from },
            to = new[] { new { email = "mencalha1986@gmail.com", name = "TransEscolar" } },
            replyTo = new { email, name = nome },
            subject = $"[TransEscolar] Novo contato: {nome}",
            htmlContent = $"""
                <h2>Novo contato pelo site</h2>
                <table cellpadding="8" style="border-collapse:collapse">
                  <tr><td><strong>Nome:</strong></td><td>{nome}</td></tr>
                  <tr><td><strong>E-mail:</strong></td><td>{email}</td></tr>
                  <tr><td><strong>Telefone:</strong></td><td>{(string.IsNullOrWhiteSpace(telefone) ? "Não informado" : telefone)}</td></tr>
                </table>
                <h3>Mensagem</h3>
                <p style="white-space:pre-wrap">{mensagem}</p>
                """
        };

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(30));

            using var client = _httpFactory.CreateClient("brevo");
            using var req = new HttpRequestMessage(HttpMethod.Post, "v3/smtp/email");
            req.Headers.Add("api-key", apiKey);
            req.Content = JsonContent.Create(payload);

            var response = await client.SendAsync(req, cts.Token);
            response.EnsureSuccessStatusCode();
            _logger.LogInformation("Email de contato enviado por {Nome} ({Email})", nome, email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao enviar email de contato de {Nome} via Brevo API", nome);
            throw;
        }
    }
}

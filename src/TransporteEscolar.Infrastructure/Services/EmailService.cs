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
    try
    {
        // 1️⃣ LER CONFIGURAÇÕES
        var apiKey = _config["Email:ApiKey"];
        var from = _config["Email:From"];
        var fromName = _config["Email:FromName"] ?? "TransporteEscolar";
 
        // 2️⃣ DEBUG: VERIFICAR LEITURA DA CHAVE
        _logger.LogInformation("===== DEBUG EMAIL =====");
        _logger.LogInformation($"📍 Email:ApiKey value: '{apiKey}'");
        _logger.LogInformation($"📍 Email:ApiKey is null: {apiKey == null}");
        _logger.LogInformation($"📍 Email:ApiKey is empty: {string.IsNullOrWhiteSpace(apiKey)}");
        _logger.LogInformation($"📍 Email:ApiKey length: {apiKey?.Length}");
        _logger.LogInformation($"📍 Email:ApiKey first 10 chars: {apiKey?.Substring(0, Math.Min(10, apiKey.Length))}...");
        _logger.LogInformation($"📍 Email:From: '{from}'");
        _logger.LogInformation($"📍 Email:FromName: '{fromName}'");
        _logger.LogInformation("=====================");
 
        // 3️⃣ VALIDAR CHAVE
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogError("❌ ERRO CRÍTICO: Email:ApiKey está vazio ou null!");
            _logger.LogError("🔍 Verifique:");
            _logger.LogError("  1. Se Email__ApiKey está configurada no Render");
            _logger.LogError("  2. Se a aplicação foi redeploy após adicionar a variável");
            _logger.LogError("  3. Se appsettings.json tem um valor padrão vazio");
            throw new InvalidOperationException("Email:ApiKey não está configurada!");
        }
 
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
 
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromSeconds(30));
 
        using var client = _httpFactory.CreateClient("brevo");
        using var req = new HttpRequestMessage(HttpMethod.Post, "v3/smtp/email");
        
        // 4️⃣ DEBUG: VERIFICAR HEADER
        _logger.LogInformation($"📤 Adicionando header api-key com {apiKey.Length} caracteres");
        req.Headers.Add("api-key", apiKey);
        req.Content = JsonContent.Create(payload);
 
        _logger.LogInformation($"📤 Enviando requisição POST para https://api.brevo.com/v3/smtp/email");
        var response = await client.SendAsync(req, cts.Token);
 
        _logger.LogInformation($"📬 Response status code: {response.StatusCode} ({(int)response.StatusCode})");
 
        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Content.ReadAsStringAsync();
            _logger.LogError($"❌ Erro na resposta Brevo:");
            _logger.LogError($"   Status: {response.StatusCode}");
            _logger.LogError($"   Body: {responseBody}");
            
            // Analisar resposta de erro
            if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
            {
                _logger.LogError("❌ ERRO 401: A chave de API está INVÁLIDA ou EXPIRADA");
                _logger.LogError("   Verifique em https://app.brevo.com - Settings → SMTP & API → API Keys");
            }
        }
 
        response.EnsureSuccessStatusCode();
        _logger.LogInformation($"✅ Email de acesso enviado com sucesso para {email}");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, $"❌ Falha ao enviar email de acesso para {email} via Brevo API from {_config["Email:From"]}");
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

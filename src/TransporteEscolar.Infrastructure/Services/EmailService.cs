using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task EnviarAcessoResponsavelAsync(string email, string nome, string senha, CancellationToken ct = default)
    {
        var host = _config["Email:Host"]!;
        var port = int.Parse(_config["Email:Port"] ?? "587");
        var username = _config["Email:Username"]!;
        var password = _config["Email:Password"]!;
        var from = _config["Email:From"]!;
        var fromName = _config["Email:FromName"] ?? "TransporteEscolar";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, from));
        message.To.Add(new MailboxAddress(nome, email));
        message.Subject = "Acesso ao Sistema de Transporte Escolar";

        message.Body = new TextPart("html")
        {
            Text = $"""
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
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(username, password, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);
            _logger.LogInformation("Email de acesso enviado para {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao enviar email de acesso para {Email} via {Host}:{Port} from {From}", email, host, port, from);
            throw;
        }
    }

    public async Task EnviarContatoAsync(string nome, string email, string telefone, string mensagem, CancellationToken ct = default)
    {
        var host = _config["Email:Host"]!;
        var port = int.Parse(_config["Email:Port"] ?? "587");
        var username = _config["Email:Username"]!;
        var password = _config["Email:Password"]!;
        var from = _config["Email:From"]!;
        var fromName = _config["Email:FromName"] ?? "TransEscolar";

        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(fromName, from));
        msg.To.Add(new MailboxAddress("TransEscolar", "mencalha1986@gmail.com"));
        msg.ReplyTo.Add(new MailboxAddress(nome, email));
        msg.Subject = $"[TransEscolar] Novo contato: {nome}";

        msg.Body = new TextPart("html")
        {
            Text = $"""
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
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(username, password, ct);
            await client.SendAsync(msg, ct);
            await client.DisconnectAsync(true, ct);
            _logger.LogInformation("Email de contato enviado por {Nome} ({Email})", nome, email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao enviar email de contato de {Nome} via {Host}:{Port}", nome, host, port);
            throw;
        }
    }
}

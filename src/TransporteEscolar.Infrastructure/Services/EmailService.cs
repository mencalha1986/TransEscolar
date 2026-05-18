using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config) => _config = config;

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

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.StartTls, ct);
        await client.AuthenticateAsync(username, password, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);
    }
}

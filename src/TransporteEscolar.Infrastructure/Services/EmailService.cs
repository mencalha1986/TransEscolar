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
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(FromName, From));
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

        await EnviarAsync(message, ct);
        _logger.LogInformation("Email de acesso enviado com sucesso para {Email}", email);
    }

    public async Task EnviarTransporteACaminhoAsync(string email, string nomeResponsavel, string turno, CancellationToken ct = default)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(FromName, From));
        message.To.Add(new MailboxAddress(nomeResponsavel, email));
        message.Subject = "🚌 O transporte escolar está a caminho!";
        message.Body = new TextPart("html")
        {
            Text = $"""
                <h2>Olá, {nomeResponsavel}!</h2>
                <p>O transporte do turno <strong>{turno}</strong> já saiu e está a caminho.</p>
                <p>Acompanhe em tempo real pelo aplicativo TransporteEscolar.</p>
                <br/>
                <p>Atenciosamente,<br/>Equipe TransporteEscolar</p>
                """
        };
        await EnviarAsync(message, ct);
        _logger.LogInformation("Email 'a caminho' enviado para {Email}", email);
    }

    public async Task EnviarCheckInAsync(string email, string nomeResponsavel, string nomeAluno, string tipoCheckIn, string hora, string? endereco, CancellationToken ct = default)
    {
        var acao = tipoCheckIn == "Embarque" ? "embarcou" : "desembarcou";
        var localInfo = !string.IsNullOrWhiteSpace(endereco) ? $" em <em>{endereco}</em>" : "";
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(FromName, From));
        message.To.Add(new MailboxAddress(nomeResponsavel, email));
        message.Subject = $"🎒 {nomeAluno} {acao} às {hora}";
        message.Body = new TextPart("html")
        {
            Text = $"""
                <h2>Olá, {nomeResponsavel}!</h2>
                <p>O aluno <strong>{nomeAluno}</strong> {acao}{localInfo} às <strong>{hora}</strong>.</p>
                <br/>
                <p>Atenciosamente,<br/>Equipe TransporteEscolar</p>
                """
        };
        await EnviarAsync(message, ct);
        _logger.LogInformation("Email de checkin ({Tipo}) enviado para {Email} - aluno {Aluno}", tipoCheckIn, email, nomeAluno);
    }

    public async Task EnviarTrajretoConcluidoAsync(string email, string nomeResponsavel, string turno, CancellationToken ct = default)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(FromName, From));
        message.To.Add(new MailboxAddress(nomeResponsavel, email));
        message.Subject = "✅ Trajeto escolar concluído";
        message.Body = new TextPart("html")
        {
            Text = $"""
                <h2>Olá, {nomeResponsavel}!</h2>
                <p>O trajeto do turno <strong>{turno}</strong> foi concluído com sucesso.</p>
                <p>Todos os alunos foram entregues.</p>
                <br/>
                <p>Atenciosamente,<br/>Equipe TransporteEscolar</p>
                """
        };
        await EnviarAsync(message, ct);
        _logger.LogInformation("Email de trajeto concluído enviado para {Email}", email);
    }

    public async Task EnviarContatoAsync(string nome, string email, string telefone, string mensagem, CancellationToken ct = default)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(FromName, From));
        message.To.Add(new MailboxAddress("TransEscolar", "mencalha1986@gmail.com"));
        message.ReplyTo.Add(new MailboxAddress(nome, email));
        message.Subject = $"[TransEscolar] Novo contato: {nome}";
        message.Body = new TextPart("html")
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

        await EnviarAsync(message, ct);
        _logger.LogInformation("Email de contato enviado por {Nome} ({Email})", nome, email);
    }

    public async Task EnviarAvisoFaltaAsync(string email, string nomeContato, string nomeAluno, string nomeResponsavel, DateOnly data, string? motivo, CancellationToken ct = default)
    {
        var dataFormatada = data.ToString("dd/MM/yyyy");
        var motivoHtml = string.IsNullOrWhiteSpace(motivo)
            ? "<p>Nenhum motivo informado.</p>"
            : $"<p><strong>Motivo:</strong> {motivo}</p>";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(FromName, From));
        message.To.Add(new MailboxAddress(nomeContato, email));
        message.Subject = $"⚠️ Ausência registrada — {nomeAluno}";
        message.Body = new TextPart("html")
        {
            Text = $"""
                <h2>Aviso de Ausência</h2>
                <p>Olá, <strong>{nomeContato}</strong>!</p>
                <p>O responsável <strong>{nomeResponsavel}</strong> registrou uma ausência:</p>
                <table cellpadding="8" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px">
                  <tr><td><strong>Aluno:</strong></td><td>{nomeAluno}</td></tr>
                  <tr><td><strong>Data:</strong></td><td>{dataFormatada}</td></tr>
                </table>
                {motivoHtml}
                <p>Abra o aplicativo para confirmar o recebimento deste aviso.</p>
                <br/>
                <p>Atenciosamente,<br/>Equipe TransporteEscolar</p>
                """
        };

        await EnviarAsync(message, ct);
        _logger.LogInformation("Email de aviso de falta enviado para {Email} — aluno {Aluno}", email, nomeAluno);
    }

    private string Host => _config["Email:Host"] ?? "smtp.gmail.com";
    private int Port => int.TryParse(_config["Email:Port"], out var p) ? p : 587;
    private string Username => _config["Email:Username"]!;
    private string Password => _config["Email:Password"]!;
    private string From => _config["Email:From"]!;
    private string FromName => _config["Email:FromName"] ?? "TransporteEscolar";

    private async Task EnviarAsync(MimeMessage message, CancellationToken ct)
    {
        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(Host, Port, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(Username, Password, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao enviar email via Brevo SMTP para {To}", message.To);
            throw;
        }
    }
}

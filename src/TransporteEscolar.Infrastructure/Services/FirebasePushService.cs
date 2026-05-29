using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.Services;

public class FirebasePushService : INotificacaoPushService
{
    private readonly IDispositivoTokenRepository _tokenRepo;
    private readonly ILogger<FirebasePushService> _logger;
    private readonly bool _enabled;

    public FirebasePushService(
        IDispositivoTokenRepository tokenRepo,
        IConfiguration config,
        ILogger<FirebasePushService> logger)
    {
        _tokenRepo = tokenRepo;
        _logger = logger;

        // Prioridade 1: JSON embutido como variável de ambiente (ideal para produção/Render)
        var jsonContent = config["Firebase:ServiceAccountJson"];
        if (!string.IsNullOrWhiteSpace(jsonContent))
        {
            if (FirebaseApp.DefaultInstance is null)
#pragma warning disable CS0618
                FirebaseApp.Create(new AppOptions { Credential = GoogleCredential.FromJson(jsonContent) });
#pragma warning restore CS0618
            _enabled = true;
            return;
        }

        // Prioridade 2: arquivo físico (desenvolvimento local)
        var path = config["Firebase:ServiceAccountPath"];
        if (string.IsNullOrWhiteSpace(path) || !File.Exists(path))
        {
            _logger.LogWarning("Firebase não configurado: serviceAccountKey.json não encontrado em '{Path}' e Firebase:ServiceAccountJson não definido. Push notifications desabilitado.", path);
            _enabled = false;
            return;
        }

        if (FirebaseApp.DefaultInstance is null)
        {
#pragma warning disable CS0618
            FirebaseApp.Create(new AppOptions { Credential = GoogleCredential.FromFile(path) });
#pragma warning restore CS0618
        }

        _enabled = true;
    }

    public async Task EnviarParaUsuariosAsync(
        IEnumerable<Guid> usuarioIds,
        string titulo,
        string corpo,
        Dictionary<string, string>? dados = null,
        CancellationToken ct = default)
    {
        if (!_enabled) return;

        var ids = usuarioIds.ToList();
        if (!ids.Any()) return;

        var tokens = (await _tokenRepo.ObterTokensPorUsuariosAsync(ids, ct)).ToList();
        if (!tokens.Any()) return;

        var messages = tokens.Select(t => new Message
        {
            Token = t,
            Notification = new Notification { Title = titulo, Body = corpo },
            Data = dados,
            Android = new AndroidConfig
            {
                Priority = Priority.High,
                Notification = new AndroidNotification
                {
                    Sound = "default",
                    ChannelId = "transescolar_default"
                }
            },
            Apns = new ApnsConfig
            {
                Aps = new Aps { Sound = "default" }
            }
        }).ToList();

        try
        {
            var response = await FirebaseMessaging.DefaultInstance.SendEachAsync(messages, ct);
            foreach (var (result, token) in response.Responses.Zip(tokens))
            {
                if (!result.IsSuccess &&
                    result.Exception?.MessagingErrorCode == MessagingErrorCode.Unregistered)
                {
                    _ = _tokenRepo.RemoverTokenAsync(token, CancellationToken.None);
                }
            }

            _logger.LogInformation("Push enviado: {Success}/{Total}", response.SuccessCount, tokens.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar push notification via Firebase");
        }
    }
}

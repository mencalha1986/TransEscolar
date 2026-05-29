using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.Services;

public class FirebasePushService : INotificacaoPushService
{
    private readonly IDispositivoTokenRepository _tokenRepo;
    private readonly ILogger<FirebasePushService> _logger;
    private readonly bool _enabled;

    public FirebasePushService(IDispositivoTokenRepository tokenRepo, ILogger<FirebasePushService> logger)
    {
        _tokenRepo = tokenRepo;
        _logger = logger;
        _enabled = FirebaseApp.DefaultInstance is not null;
        if (!_enabled)
            _logger.LogWarning("Firebase não inicializado. Push notifications desabilitado.");
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

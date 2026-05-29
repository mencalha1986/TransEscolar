namespace TransporteEscolar.Domain.Interfaces;

public interface INotificacaoPushService
{
    Task EnviarParaUsuariosAsync(
        IEnumerable<Guid> usuarioIds,
        string titulo,
        string corpo,
        Dictionary<string, string>? dados = null,
        CancellationToken ct = default);
}

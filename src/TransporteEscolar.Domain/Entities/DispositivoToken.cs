using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public class DispositivoToken : Entity
{
    public Guid UsuarioId { get; private set; }
    public string Token { get; private set; } = default!;
    public string Plataforma { get; private set; } = default!;
    public Guid TransportadorId { get; private set; }

    private DispositivoToken() { }

    public static DispositivoToken Criar(Guid usuarioId, Guid transportadorId, string token, string plataforma) =>
        new()
        {
            UsuarioId = usuarioId,
            TransportadorId = transportadorId,
            Token = token,
            Plataforma = plataforma.ToLowerInvariant()
        };

    public void AtualizarToken(string token)
    {
        Token = token;
        MarcarAtualizado();
    }
}

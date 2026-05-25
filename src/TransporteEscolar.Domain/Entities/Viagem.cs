using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum StatusViagem { AguardandoPartida, EmRota, Concluida }

public class Viagem : Entity
{
    public Guid TransportadorId { get; private set; }
    public TurnoAluno Turno { get; private set; }
    public DateOnly Data { get; private set; }
    public StatusViagem Status { get; private set; } = StatusViagem.AguardandoPartida;
    public double? LatitudeAtual { get; private set; }
    public double? LongitudeAtual { get; private set; }
    public DateTime? IniciadaEm { get; private set; }
    public DateTime? ConcluidaEm { get; private set; }

    private Viagem() { }

    public static Viagem Iniciar(TurnoAluno turno, Guid transportadorId) =>
        new()
        {
            TransportadorId = transportadorId,
            Turno = turno,
            Data = DateOnly.FromDateTime(DateTime.UtcNow),
            Status = StatusViagem.EmRota,
            IniciadaEm = DateTime.UtcNow
        };

    public void AtualizarPosicao(double latitude, double longitude)
    {
        LatitudeAtual = latitude;
        LongitudeAtual = longitude;
        MarcarAtualizado();
    }

    public void Concluir()
    {
        Status = StatusViagem.Concluida;
        ConcluidaEm = DateTime.UtcNow;
        MarcarAtualizado();
    }
}

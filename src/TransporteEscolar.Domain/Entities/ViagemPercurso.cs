using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public class ViagemPercurso : Entity
{
    public Guid ViagemId { get; private set; }
    public double Latitude { get; private set; }
    public double Longitude { get; private set; }
    public DateTime Timestamp { get; private set; }

    private ViagemPercurso() { }

    public static ViagemPercurso Criar(Guid viagemId, double latitude, double longitude) => new()
    {
        ViagemId = viagemId,
        Latitude = latitude,
        Longitude = longitude,
        Timestamp = DateTime.UtcNow
    };
}

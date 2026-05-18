using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum TipoCheckIn { Embarque, Desembarque }

public class CheckIn : Entity
{
    public Guid AlunoId { get; private set; }
    public TipoCheckIn Tipo { get; private set; }
    public DateTime HoraRegistro { get; private set; }
    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }
    public Guid TransportadorId { get; private set; }

    private CheckIn() { }

    public static CheckIn Registrar(Guid alunoId, TipoCheckIn tipo, Guid transportadorId,
        double? latitude = null, double? longitude = null) =>
        new()
        {
            AlunoId = alunoId, Tipo = tipo,
            HoraRegistro = DateTime.UtcNow, Latitude = latitude, Longitude = longitude,
            TransportadorId = transportadorId
        };
}

using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum TipoCheckIn { Embarque, Desembarque }

public class CheckIn : Entity
{
    public Guid AlunoId { get; private set; }
    public Guid TransporteId { get; private set; }
    public TipoCheckIn Tipo { get; private set; }
    public DateTime HoraRegistro { get; private set; }
    public double? Latitude { get; private set; }
    public double? Longitude { get; private set; }

    private CheckIn() { }

    public static CheckIn Registrar(Guid alunoId, Guid transporteId, TipoCheckIn tipo,
        double? latitude = null, double? longitude = null) =>
        new()
        {
            AlunoId = alunoId, TransporteId = transporteId, Tipo = tipo,
            HoraRegistro = DateTime.UtcNow, Latitude = latitude, Longitude = longitude
        };
}

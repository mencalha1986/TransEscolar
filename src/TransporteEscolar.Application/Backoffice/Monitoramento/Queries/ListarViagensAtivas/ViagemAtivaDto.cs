namespace TransporteEscolar.Application.Backoffice.Monitoramento.Queries.ListarViagensAtivas;

public record ViagemAtivaDto(
    Guid Id,
    Guid TransportadorId,
    string TransportadorNome,
    string Turno,
    double? Latitude,
    double? Longitude,
    DateTime? IniciadaEm,
    int Embarcados,
    int Desembarcados
);

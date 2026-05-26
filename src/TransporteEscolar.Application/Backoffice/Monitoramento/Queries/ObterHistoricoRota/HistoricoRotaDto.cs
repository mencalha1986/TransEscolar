namespace TransporteEscolar.Application.Backoffice.Monitoramento.Queries.ObterHistoricoRota;

public record CheckInHistoricoDto(
    string AlunoNome,
    string Tipo,
    DateTime HoraRegistro,
    double? Latitude,
    double? Longitude,
    string? Endereco
);

public record ViagemHistoricoDto(
    Guid Id,
    string Turno,
    string Status,
    DateTime? IniciadaEm,
    DateTime? ConcluidaEm,
    IEnumerable<CheckInHistoricoDto> CheckIns
);

public record HistoricoRotaDto(
    Guid TransportadorId,
    string TransportadorNome,
    IEnumerable<ViagemHistoricoDto> Viagens
);

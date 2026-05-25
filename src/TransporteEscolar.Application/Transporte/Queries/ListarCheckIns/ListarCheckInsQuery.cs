using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Transporte.Queries.ListarCheckIns;

public record CheckInDto(
    Guid Id,
    Guid AlunoId,
    string AlunoNome,
    string AlunoTurno,
    TipoCheckIn Tipo,
    DateTime HoraRegistro,
    double? Latitude,
    double? Longitude,
    string? Endereco,
    Guid? ViagemId);

public record ListarCheckInsQuery(DateOnly? Data = null, string? Turno = null) : IRequest<Result<IEnumerable<CheckInDto>>>;

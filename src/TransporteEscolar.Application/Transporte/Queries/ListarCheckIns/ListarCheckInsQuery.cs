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
    double? Longitude);

public record ListarCheckInsQuery : IRequest<Result<IEnumerable<CheckInDto>>>;

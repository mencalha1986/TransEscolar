using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Transporte.Commands.RegistrarCheckIn;

public record RegistrarCheckInResultDto(Guid Id, string? Endereco);

public record RegistrarCheckInCommand(
    Guid AlunoId,
    TipoCheckIn Tipo,
    double? Latitude = null,
    double? Longitude = null) : IRequest<Result<RegistrarCheckInResultDto>>;

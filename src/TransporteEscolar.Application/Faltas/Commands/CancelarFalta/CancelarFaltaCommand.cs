using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Faltas.Commands.CancelarFalta;

public record CancelarFaltaCommand(Guid FaltaId) : IRequest<Result<bool>>;

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Faltas.Queries.ListarFaltas;

namespace TransporteEscolar.Application.Faltas.Commands.DarCienciaFalta;

public record DarCienciaFaltaCommand(Guid FaltaId) : IRequest<Result<FaltaDto>>;

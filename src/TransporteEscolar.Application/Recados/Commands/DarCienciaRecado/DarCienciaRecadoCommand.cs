using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Recados.Commands.DarCienciaRecado;

public record DarCienciaRecadoCommand(Guid Id) : IRequest<Result<bool>>;

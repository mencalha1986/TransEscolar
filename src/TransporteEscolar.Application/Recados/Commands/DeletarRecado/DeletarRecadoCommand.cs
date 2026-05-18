using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Recados.Commands.DeletarRecado;

public record DeletarRecadoCommand(Guid Id) : IRequest<Result<bool>>;

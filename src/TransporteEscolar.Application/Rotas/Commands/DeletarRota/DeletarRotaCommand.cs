using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Rotas.Commands.DeletarRota;

public record DeletarRotaCommand(Guid Id) : IRequest<Result<bool>>;

using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.DeletarTransportador;

public record DeletarTransportadorCommand(Guid Id) : IRequest<Result<bool>>;

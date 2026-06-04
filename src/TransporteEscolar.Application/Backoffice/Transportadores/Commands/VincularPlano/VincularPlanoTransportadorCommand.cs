using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.VincularPlano;

public record VincularPlanoTransportadorCommand(Guid TransportadorId, Guid PlanoId) : IRequest<Result<bool>>;

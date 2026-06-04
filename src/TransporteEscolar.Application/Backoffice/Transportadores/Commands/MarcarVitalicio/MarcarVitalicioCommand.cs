using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.MarcarVitalicio;

public record MarcarVitalicioCommand(Guid TransportadorId, bool Vitalicio) : IRequest<Result<bool>>;

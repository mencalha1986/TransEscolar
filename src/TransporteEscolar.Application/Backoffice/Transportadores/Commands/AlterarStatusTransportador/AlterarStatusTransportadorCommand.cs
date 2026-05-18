using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.AlterarStatusTransportador;

public record AlterarStatusTransportadorCommand(Guid TransportadorId, StatusTransportador Status)
    : IRequest<Result<bool>>;

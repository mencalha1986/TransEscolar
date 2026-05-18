using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Queries.ImpersonarTransportador;

public record ImpersonarTransportadorQuery(Guid TransportadorId) : IRequest<Result<string>>;

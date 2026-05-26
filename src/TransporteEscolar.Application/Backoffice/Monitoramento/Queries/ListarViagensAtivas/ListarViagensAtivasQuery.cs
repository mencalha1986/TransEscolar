using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Monitoramento.Queries.ListarViagensAtivas;

public record ListarViagensAtivasQuery : IRequest<Result<IEnumerable<ViagemAtivaDto>>>;

using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Monitoramento.Queries.ObterHistoricoRota;

public record ObterHistoricoRotaQuery(Guid TransportadorId, DateOnly Data)
    : IRequest<Result<HistoricoRotaDto>>;

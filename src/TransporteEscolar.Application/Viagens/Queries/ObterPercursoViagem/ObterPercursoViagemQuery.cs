using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Viagens.Queries.ObterPercursoViagem;

public record ObterPercursoViagemQuery(Guid ViagemId) : IRequest<Result<IEnumerable<PercursoPontoDto>>>;

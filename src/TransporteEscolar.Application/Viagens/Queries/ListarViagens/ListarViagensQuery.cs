using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Viagens.Queries.ObterViagemAtual;

namespace TransporteEscolar.Application.Viagens.Queries.ListarViagens;

public record ListarViagensQuery(DateOnly? Data = null) : IRequest<Result<IEnumerable<ViagemDto>>>;

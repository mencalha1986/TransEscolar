using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Transportes.Queries.ListarTransportes;

public record TransporteResumoDto(Guid Id, string Placa, string NomeMotorista, int CapacidadeMaxima, string Status);

public record ListarTransportesQuery : IRequest<Result<IEnumerable<TransporteResumoDto>>>;

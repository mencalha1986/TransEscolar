using MediatR;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Queries.ListarTransportadores;

public record TransportadorResumoDto(
    Guid Id,
    string NomeEmpresa,
    string NomeContato,
    string Email,
    StatusTransportador Status,
    DateTime CriadoEm,
    string? NomePlano
);

public record ListarTransportadoresQuery : IRequest<IEnumerable<TransportadorResumoDto>>;

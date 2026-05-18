using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Recados.Queries.ListarRecados;

public record RecadoDto(
    Guid Id,
    string Conteudo,
    string Tipo,
    string AutorNome,
    DateTime CriadoEm,
    bool EuEnviei);

public record ListarRecadosQuery : IRequest<Result<IEnumerable<RecadoDto>>>;

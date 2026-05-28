using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Recados.Queries.ListarRecados;

public record RecadoDto(
    Guid Id,
    string Conteudo,
    string Tipo,
    string AutorNome,
    string? AlunoNomes,
    DateTime CriadoEm,
    bool EuEnviei,
    bool CienciaAdmin,
    DateTime? CienciaAdminDadaEm);

public record ListarRecadosQuery : IRequest<Result<IEnumerable<RecadoDto>>>;

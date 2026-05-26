using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Responsaveis.Queries.ObterPerfilResponsavel;

public record AlunoResumoDto(Guid Id, string Nome, string Turno);

public record PerfilResponsavelDto(Guid ResponsavelId, string Nome, IEnumerable<AlunoResumoDto> Alunos);

public record ObterPerfilResponsavelQuery : IRequest<Result<PerfilResponsavelDto>>;

using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Responsaveis.Queries.ObterPerfilResponsavel;

public record AlunoResumoDto(Guid Id, string Nome, string Turno);

public record TransportadorContatoDto(string NomeEmpresa, string? Telefone, string Email);

public record PerfilResponsavelDto(Guid ResponsavelId, string Nome, IEnumerable<AlunoResumoDto> Alunos, TransportadorContatoDto? Transportador);

public record ObterPerfilResponsavelQuery : IRequest<Result<PerfilResponsavelDto>>;

using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Alunos.Queries.ListarAlunos;

public record AlunoDto(Guid Id, string Nome, DateTime DataNascimento, Guid EscolaId, bool TemFoto);

public record ListarAlunosQuery(Guid? EscolaId = null) : IRequest<Result<IEnumerable<AlunoDto>>>;

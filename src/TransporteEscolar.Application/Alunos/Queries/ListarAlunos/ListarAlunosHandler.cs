using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Alunos.Queries.ListarAlunos;

public class ListarAlunosHandler : IRequestHandler<ListarAlunosQuery, Result<IEnumerable<AlunoDto>>>
{
    private readonly IAlunoRepository _repo;

    public ListarAlunosHandler(IAlunoRepository repo) => _repo = repo;

    public async Task<Result<IEnumerable<AlunoDto>>> Handle(ListarAlunosQuery request, CancellationToken ct)
    {
        var alunos = request.EscolaId.HasValue
            ? await _repo.ListarPorEscolaAsync(request.EscolaId.Value, ct)
            : await _repo.ListarTodosAsync(ct);

        var dtos = alunos.Select(a => new AlunoDto(a.Id, a.Nome, a.DataNascimento, a.EscolaId, a.Foto != null));
        return Result<IEnumerable<AlunoDto>>.Success(dtos);
    }
}

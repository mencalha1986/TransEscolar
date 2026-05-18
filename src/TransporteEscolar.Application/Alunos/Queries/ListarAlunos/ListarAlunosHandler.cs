using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Alunos.Queries.ListarAlunos;

public class ListarAlunosHandler : IRequestHandler<ListarAlunosQuery, Result<IEnumerable<AlunoDto>>>
{
    private readonly IAlunoRepository _repo;
    private readonly IEscolaRepository _escolaRepo;

    public ListarAlunosHandler(IAlunoRepository repo, IEscolaRepository escolaRepo)
    {
        _repo = repo;
        _escolaRepo = escolaRepo;
    }

    public async Task<Result<IEnumerable<AlunoDto>>> Handle(ListarAlunosQuery request, CancellationToken ct)
    {
        var alunos = request.EscolaId.HasValue
            ? await _repo.ListarPorEscolaAsync(request.EscolaId.Value, ct)
            : await _repo.ListarTodosAsync(ct);

        var escolas = await _escolaRepo.ListarTodosAsync(ct);
        var escolaMap = escolas.ToDictionary(e => e.Id, e => e.Nome);

        var dtos = alunos.Select(a => new AlunoDto(
            a.Id, a.Nome, a.DataNascimento, a.EscolaId,
            escolaMap.GetValueOrDefault(a.EscolaId, a.EscolaId.ToString()),
            a.Foto != null, a.ValorMensalidade, a.DiaVencimento, a.Turno.ToString()));

        return Result<IEnumerable<AlunoDto>>.Success(dtos);
    }
}

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Transporte.Queries.ListarCheckIns;

public class ListarCheckInsHandler : IRequestHandler<ListarCheckInsQuery, Result<IEnumerable<CheckInDto>>>
{
    private readonly ITransporteRepository _repo;
    private readonly IAlunoRepository _alunoRepo;

    public ListarCheckInsHandler(ITransporteRepository repo, IAlunoRepository alunoRepo)
        => (_repo, _alunoRepo) = (repo, alunoRepo);

    public async Task<Result<IEnumerable<CheckInDto>>> Handle(ListarCheckInsQuery request, CancellationToken ct)
    {
        var data = request.Data ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var checkIns = await _repo.ListarCheckInsAsync(data, ct);
        var alunos = await _alunoRepo.ListarTodosAsync(ct);
        var alunoMap = alunos.ToDictionary(a => a.Id, a => (Nome: a.Nome, Turno: a.Turno.ToString()));

        var filtrados = checkIns.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(request.Turno))
            filtrados = filtrados.Where(c =>
                alunoMap.TryGetValue(c.AlunoId, out var a) &&
                string.Equals(a.Turno, request.Turno, StringComparison.OrdinalIgnoreCase));

        var dtos = filtrados
            .OrderByDescending(c => c.HoraRegistro)
            .Select(c =>
            {
                var aluno = alunoMap.TryGetValue(c.AlunoId, out var a) ? a : (Nome: c.AlunoId.ToString(), Turno: "");
                return new CheckInDto(c.Id, c.AlunoId, aluno.Nome, aluno.Turno, c.Tipo, c.HoraRegistro, c.Latitude, c.Longitude, c.Endereco, c.ViagemId);
            });

        return Result<IEnumerable<CheckInDto>>.Success(dtos);
    }
}

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Faltas.Queries.ListarFaltas;

public class ListarFaltasHandler : IRequestHandler<ListarFaltasQuery, Result<IEnumerable<FaltaDto>>>
{
    private readonly IFaltaRepository _repo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly ICurrentTenantService _tenant;

    public ListarFaltasHandler(IFaltaRepository repo, IAlunoRepository alunoRepo, ICurrentTenantService tenant)
        => (_repo, _alunoRepo, _tenant) = (repo, alunoRepo, tenant);

    public async Task<Result<IEnumerable<FaltaDto>>> Handle(ListarFaltasQuery request, CancellationToken ct)
    {
        var perfil = _tenant.UsuarioPerfil;
        var usuarioId = _tenant.UsuarioId;

        var faltas = await _repo.ListarAsync(request.Data, request.AlunoId, ct);

        if (perfil == "Responsavel" && usuarioId.HasValue)
        {
            var alunos = await _alunoRepo.ListarPorResponsavelAsync(usuarioId.Value, ct);
            var alunoIds = alunos.Select(a => a.Id).ToHashSet();
            faltas = faltas.Where(f => alunoIds.Contains(f.AlunoId));
        }

        var dtos = faltas
            .OrderBy(f => f.Data)
            .Select(f => new FaltaDto(f.Id, f.AlunoId, f.AlunoNome, f.Data, f.Motivo, f.CriadoEm));

        return Result<IEnumerable<FaltaDto>>.Success(dtos);
    }
}

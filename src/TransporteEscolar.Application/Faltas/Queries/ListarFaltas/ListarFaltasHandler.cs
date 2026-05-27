using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Faltas.Queries.ListarFaltas;

public class ListarFaltasHandler : IRequestHandler<ListarFaltasQuery, Result<IEnumerable<FaltaDto>>>
{
    private readonly IFaltaRepository _repo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly ICurrentTenantService _tenant;

    public ListarFaltasHandler(IFaltaRepository repo, IAlunoRepository alunoRepo, IResponsavelRepository responsavelRepo, ICurrentTenantService tenant)
        => (_repo, _alunoRepo, _responsavelRepo, _tenant) = (repo, alunoRepo, responsavelRepo, tenant);

    public async Task<Result<IEnumerable<FaltaDto>>> Handle(ListarFaltasQuery request, CancellationToken ct)
    {
        var perfil = _tenant.UsuarioPerfil;

        var faltas = await _repo.ListarAsync(request.Data, request.AlunoId, ct);

        if (perfil == "Responsavel")
        {
            var email = _tenant.UsuarioEmail;
            if (!string.IsNullOrWhiteSpace(email))
            {
                var responsavel = await _responsavelRepo.ObterPorEmailAsync(email, ct);
                if (responsavel is not null)
                {
                    var alunos = await _alunoRepo.ListarPorResponsavelAsync(responsavel.Id, ct);
                    var alunoIds = alunos.Select(a => a.Id).ToHashSet();
                    faltas = faltas.Where(f => alunoIds.Contains(f.AlunoId));
                }
            }
        }

        var dtos = faltas
            .OrderBy(f => f.Data)
            .Select(f => new FaltaDto(f.Id, f.AlunoId, f.AlunoNome, f.Data, f.Motivo, f.CriadoEm));

        return Result<IEnumerable<FaltaDto>>.Success(dtos);
    }
}

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Recados.Queries.ListarRecados;

public class ListarRecadosHandler : IRequestHandler<ListarRecadosQuery, Result<IEnumerable<RecadoDto>>>
{
    private readonly IRecadoRepository _repo;
    private readonly ICurrentTenantService _tenant;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IAlunoRepository _alunoRepo;

    public ListarRecadosHandler(
        IRecadoRepository repo,
        ICurrentTenantService tenant,
        IResponsavelRepository responsavelRepo,
        IAlunoRepository alunoRepo)
        => (_repo, _tenant, _responsavelRepo, _alunoRepo) = (repo, tenant, responsavelRepo, alunoRepo);

    public async Task<Result<IEnumerable<RecadoDto>>> Handle(ListarRecadosQuery request, CancellationToken ct)
    {
        var usuarioId = _tenant.UsuarioId;
        var perfil = _tenant.UsuarioPerfil;

        var todos = await _repo.ListarTodosAsync(ct);

        IEnumerable<Recado> filtrados;

        if (perfil is "Admin" or "SuperAdmin" or "Motorista")
        {
            filtrados = todos;
        }
        else
        {
            var email = _tenant.UsuarioEmail;
            var responsavel = email is not null
                ? await _responsavelRepo.ObterPorEmailAsync(email, ct)
                : null;
            var alunos = responsavel is not null
                ? (await _alunoRepo.ListarPorResponsavelAsync(responsavel.Id, ct)).ToList()
                : [];
            var turnos = alunos.Select(a => a.Turno).ToHashSet();
            var escolaIds = alunos.Select(a => a.EscolaId).ToHashSet();

            filtrados = todos.Where(r =>
                r.Tipo == TipoRecado.Geral ||
                r.Tipo == TipoRecado.DoResponsavel ||
                r.DestinatarioUsuarioId == usuarioId ||
                r.AutorId == usuarioId ||
                (r.Tipo == TipoRecado.ParaTurno && r.TurnoFiltro.HasValue && turnos.Contains(r.TurnoFiltro.Value)) ||
                (r.Tipo == TipoRecado.ParaEscola && r.EscolaFiltroId.HasValue && escolaIds.Contains(r.EscolaFiltroId.Value)));
        }

        var dtos = filtrados
            .OrderByDescending(r => r.CriadoEm)
            .Select(r => new RecadoDto(r.Id, r.Conteudo, r.Tipo.ToString(), r.AutorNome, r.AlunoNomes, r.CriadoEm, r.AutorId == usuarioId, r.CienciaAdmin, r.CienciaAdminDadaEm));

        return Result<IEnumerable<RecadoDto>>.Success(dtos);
    }
}

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Recados.Queries.ListarRecados;

public class ListarRecadosHandler : IRequestHandler<ListarRecadosQuery, Result<IEnumerable<RecadoDto>>>
{
    private readonly IRecadoRepository _repo;
    private readonly ICurrentTenantService _tenant;

    public ListarRecadosHandler(IRecadoRepository repo, ICurrentTenantService tenant)
        => (_repo, _tenant) = (repo, tenant);

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
            filtrados = todos.Where(r =>
                r.Tipo == TipoRecado.Geral ||
                r.Tipo == TipoRecado.DoResponsavel ||
                r.DestinatarioUsuarioId == usuarioId ||
                r.AutorId == usuarioId);
        }

        var dtos = filtrados
            .OrderByDescending(r => r.CriadoEm)
            .Select(r => new RecadoDto(r.Id, r.Conteudo, r.Tipo.ToString(), r.AutorNome, r.AlunoNomes, r.CriadoEm, r.AutorId == usuarioId, r.CienciaAdmin, r.CienciaAdminDadaEm));

        return Result<IEnumerable<RecadoDto>>.Success(dtos);
    }
}

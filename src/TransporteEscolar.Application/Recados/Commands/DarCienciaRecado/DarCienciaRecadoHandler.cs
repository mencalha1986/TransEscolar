using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Recados.Commands.DarCienciaRecado;

public class DarCienciaRecadoHandler : IRequestHandler<DarCienciaRecadoCommand, Result<bool>>
{
    private readonly IRecadoRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public DarCienciaRecadoHandler(IRecadoRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<bool>> Handle(DarCienciaRecadoCommand request, CancellationToken ct)
    {
        var perfil = _tenant.UsuarioPerfil;
        if (perfil is not ("Admin" or "SuperAdmin"))
            return Result<bool>.Failure("Sem permissão para dar ciência neste recado.");

        var recado = await _repo.ObterPorIdAsync(request.Id, ct);
        if (recado is null) return Result<bool>.Failure("Recado não encontrado.");

        if (recado.CienciaAdmin)
            return Result<bool>.Success(true);

        recado.DarCiencia();
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

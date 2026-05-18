using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Recados.Commands.DeletarRecado;

public class DeletarRecadoHandler : IRequestHandler<DeletarRecadoCommand, Result<bool>>
{
    private readonly IRecadoRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public DeletarRecadoHandler(IRecadoRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<bool>> Handle(DeletarRecadoCommand request, CancellationToken ct)
    {
        var usuarioId = _tenant.UsuarioId;
        var perfil = _tenant.UsuarioPerfil;

        var recado = await _repo.ObterPorIdAsync(request.Id, ct);
        if (recado is null) return Result<bool>.Failure("Recado não encontrado.");

        var isAdmin = perfil is "Admin" or "SuperAdmin";
        if (!isAdmin && recado.AutorId != usuarioId)
            return Result<bool>.Failure("Sem permissão para remover este recado.");

        _repo.Remover(recado);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

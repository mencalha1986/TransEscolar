using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Faltas.Commands.CancelarFalta;

public class CancelarFaltaHandler : IRequestHandler<CancelarFaltaCommand, Result<bool>>
{
    private readonly IFaltaRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public CancelarFaltaHandler(IFaltaRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<bool>> Handle(CancelarFaltaCommand request, CancellationToken ct)
    {
        var falta = await _repo.ObterPorIdAsync(request.FaltaId, ct);
        if (falta is null) return Result<bool>.Failure("Falta não encontrada.");

        var usuarioId = _tenant.UsuarioId;
        var perfil = _tenant.UsuarioPerfil;

        if (perfil == "Responsavel" && falta.ResponsavelId != usuarioId)
            return Result<bool>.Failure("Sem permissão para cancelar esta falta.");

        _repo.Remover(falta);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

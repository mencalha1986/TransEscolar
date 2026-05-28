using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Faltas.Queries.ListarFaltas;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Faltas.Commands.DarCienciaFalta;

public class DarCienciaFaltaHandler : IRequestHandler<DarCienciaFaltaCommand, Result<FaltaDto>>
{
    private readonly IFaltaRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public DarCienciaFaltaHandler(IFaltaRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<FaltaDto>> Handle(DarCienciaFaltaCommand request, CancellationToken ct)
    {
        var perfil = _tenant.UsuarioPerfil;
        if (perfil == "Responsavel")
            return Result<FaltaDto>.Failure("Somente o transportador pode dar ciência de uma ausência.");

        var falta = await _repo.ObterPorIdAsync(request.FaltaId, ct);
        if (falta is null) return Result<FaltaDto>.Failure("Falta não encontrada.");

        if (falta.TransportadorId != _tenant.TenantId)
            return Result<FaltaDto>.Failure("Sem permissão para acessar esta falta.");

        falta.DarCiencia();
        await _uow.CommitAsync(ct);

        return Result<FaltaDto>.Success(new FaltaDto(
            falta.Id, falta.AlunoId, falta.AlunoNome, falta.Data, falta.Motivo,
            falta.CriadoEm, falta.CienciaTransportador, falta.CienciaDadaEm));
    }
}

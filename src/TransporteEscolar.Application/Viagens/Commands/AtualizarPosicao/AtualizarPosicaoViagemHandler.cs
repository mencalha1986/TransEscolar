using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Commands.AtualizarPosicao;

public class AtualizarPosicaoViagemHandler : IRequestHandler<AtualizarPosicaoViagemCommand, Result<bool>>
{
    private readonly IViagemRepository _repo;
    private readonly IViagemPercursoRepository _percursoRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public AtualizarPosicaoViagemHandler(IViagemRepository repo, IViagemPercursoRepository percursoRepo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _percursoRepo, _uow, _tenant) = (repo, percursoRepo, uow, tenant);

    public async Task<Result<bool>> Handle(AtualizarPosicaoViagemCommand request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<bool>.Failure("Usuário sem transportador associado.");

        var viagem = await _repo.ObterPorIdAsync(request.ViagemId, ct);
        if (viagem == null)
            return Result<bool>.Failure("Viagem não encontrada.");
        if (viagem.Status != StatusViagem.EmRota)
            return Result<bool>.Failure("A viagem não está em andamento.");

        viagem.AtualizarPosicao(request.Latitude, request.Longitude);
        _repo.Atualizar(viagem);
        _percursoRepo.Adicionar(ViagemPercurso.Criar(viagem.Id, request.Latitude, request.Longitude));
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

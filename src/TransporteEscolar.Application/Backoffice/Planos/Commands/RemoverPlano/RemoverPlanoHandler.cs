using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Planos.Commands.RemoverPlano;

public class RemoverPlanoHandler : IRequestHandler<RemoverPlanoCommand, Result<bool>>
{
    private readonly IPlanoRepository _planoRepo;
    private readonly IAssinaturaRepository _assinaturaRepo;
    private readonly IUnitOfWork _uow;

    public RemoverPlanoHandler(IPlanoRepository planoRepo, IAssinaturaRepository assinaturaRepo, IUnitOfWork uow)
        => (_planoRepo, _assinaturaRepo, _uow) = (planoRepo, assinaturaRepo, uow);

    public async Task<Result<bool>> Handle(RemoverPlanoCommand request, CancellationToken ct)
    {
        var plano = await _planoRepo.ObterPorIdAsync(request.PlanoId, ct);
        if (plano is null)
            return Result<bool>.Failure("Plano não encontrado.");

        if (await _assinaturaRepo.ExistePorPlanoAsync(request.PlanoId, ct))
            return Result<bool>.Failure("Este plano possui clientes vinculados e não pode ser removido.");

        _planoRepo.Remover(plano);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

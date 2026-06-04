using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.VincularPlano;

public class VincularPlanoTransportadorHandler : IRequestHandler<VincularPlanoTransportadorCommand, Result<bool>>
{
    private readonly ITransportadorRepository _transportadorRepo;
    private readonly IAssinaturaRepository _assinaturaRepo;
    private readonly IPlanoRepository _planoRepo;
    private readonly IUnitOfWork _uow;

    public VincularPlanoTransportadorHandler(
        ITransportadorRepository transportadorRepo,
        IAssinaturaRepository assinaturaRepo,
        IPlanoRepository planoRepo,
        IUnitOfWork uow)
        => (_transportadorRepo, _assinaturaRepo, _planoRepo, _uow) = (transportadorRepo, assinaturaRepo, planoRepo, uow);

    public async Task<Result<bool>> Handle(VincularPlanoTransportadorCommand request, CancellationToken ct)
    {
        var transportador = await _transportadorRepo.ObterPorIdAsync(request.TransportadorId, ct);
        if (transportador is null)
            return Result<bool>.Failure("Transportador não encontrado.");

        var plano = await _planoRepo.ObterPorIdAsync(request.PlanoId, ct);
        if (plano is null)
            return Result<bool>.Failure("Plano não encontrado.");

        var assinatura = await _assinaturaRepo.ObterPorTransportadorAsync(request.TransportadorId, ct);

        if (assinatura is null)
        {
            var result = Assinatura.Criar(request.TransportadorId, request.PlanoId, plano.PrecoMensal, DateTime.UtcNow);
            if (!result.IsSuccess)
                return Result<bool>.Failure(result.Error);
            await _assinaturaRepo.AdicionarAsync(result.Value, ct);
        }
        else
        {
            assinatura.AlterarPlano(request.PlanoId, plano.PrecoMensal);
            _assinaturaRepo.Atualizar(assinatura);
        }

        await _uow.CommitAsync(ct);
        return Result<bool>.Success(true);
    }
}

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;
using TransporteEntity = TransporteEscolar.Domain.Entities.Transporte;

namespace TransporteEscolar.Application.Transportes.Commands.CadastrarTransporte;

public class CadastrarTransporteHandler : IRequestHandler<CadastrarTransporteCommand, Result<Guid>>
{
    private readonly ITransporteRepository _repo;
    private readonly ITransportadorRepository _transportadorRepo;
    private readonly IAssinaturaRepository _assinaturaRepo;
    private readonly IPlanoRepository _planoRepo;
    private readonly ICurrentTenantService _tenant;
    private readonly IUnitOfWork _uow;

    public CadastrarTransporteHandler(
        ITransporteRepository repo,
        ITransportadorRepository transportadorRepo,
        IAssinaturaRepository assinaturaRepo,
        IPlanoRepository planoRepo,
        ICurrentTenantService tenant,
        IUnitOfWork uow)
    {
        (_repo, _transportadorRepo, _assinaturaRepo, _planoRepo, _tenant, _uow)
            = (repo, transportadorRepo, assinaturaRepo, planoRepo, tenant, uow);
    }

    public async Task<Result<Guid>> Handle(CadastrarTransporteCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<Guid>.Failure("Tenant não identificado. Operação não permitida para SuperAdmin.");

        var limitError = await VerificarLimiteRotasAsync(transportadorId, ct);
        if (limitError is not null)
            return Result<Guid>.Failure(limitError);

        var result = TransporteEntity.Criar(request.Placa, request.NomeMotorista, request.CapacidadeMaxima, transportadorId);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }

    private async Task<string?> VerificarLimiteRotasAsync(Guid transportadorId, CancellationToken ct)
    {
        var transportador = await _transportadorRepo.ObterPorIdAsync(transportadorId, ct);
        if (transportador?.Vitalicio == true)
            return null;

        var assinatura = await _assinaturaRepo.ObterPorTransportadorAsync(transportadorId, ct);
        if (assinatura is null)
            return null;

        var plano = await _planoRepo.ObterPorIdAsync(assinatura.PlanoId, ct);
        if (plano?.LimiteRotas is not int limite)
            return null;

        var total = await _transportadorRepo.ContarTransportesAsync(transportadorId, ct);
        if (total >= limite)
            return $"Limite de {limite} rota(s) do plano '{plano.Nome}' atingido. Faça upgrade do plano para adicionar mais rotas.";

        return null;
    }
}

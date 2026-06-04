using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Viagens.Queries.ObterViagemAtual;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Queries.ListarViagens;

public class ListarViagensHandler : IRequestHandler<ListarViagensQuery, Result<IEnumerable<ViagemDto>>>
{
    private readonly IViagemRepository _repo;
    private readonly ICurrentTenantService _tenant;
    private readonly IAssinaturaRepository _assinaturaRepo;
    private readonly IPlanoRepository _planoRepo;
    private readonly ITransportadorRepository _transportadorRepo;

    public ListarViagensHandler(
        IViagemRepository repo,
        ICurrentTenantService tenant,
        IAssinaturaRepository assinaturaRepo,
        IPlanoRepository planoRepo,
        ITransportadorRepository transportadorRepo)
    {
        (_repo, _tenant) = (repo, tenant);
        (_assinaturaRepo, _planoRepo, _transportadorRepo) = (assinaturaRepo, planoRepo, transportadorRepo);
    }

    public async Task<Result<IEnumerable<ViagemDto>>> Handle(ListarViagensQuery request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<IEnumerable<ViagemDto>>.Failure("Usuário sem transportador associado.");

        var transportadorId = _tenant.TenantId.Value;
        var data = request.Data ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var transportador = await _transportadorRepo.ObterPorIdAsync(transportadorId, ct);
        if (transportador?.Vitalicio != true)
        {
            var assinatura = await _assinaturaRepo.ObterPorTransportadorAsync(transportadorId, ct);
            if (assinatura is not null)
            {
                var plano = await _planoRepo.ObterPorIdAsync(assinatura.PlanoId, ct);
                if (plano?.RetencaoHistoricoDias is int retencao)
                {
                    var dataMinima = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-retencao));
                    if (data < dataMinima)
                        return Result<IEnumerable<ViagemDto>>.Failure(
                            $"O plano '{plano.Nome}' permite histórico de apenas {retencao} dias. Faça upgrade para acessar registros mais antigos.");
                }
            }
        }

        var viagens = await _repo.ListarPorDataAsync(data, transportadorId, ct);

        var dtos = viagens.Select(v => new ViagemDto(
            v.Id,
            v.Turno.ToString(),
            v.Data,
            v.Status.ToString(),
            v.LatitudeAtual,
            v.LongitudeAtual,
            v.IniciadaEm,
            v.ConcluidaEm));

        return Result<IEnumerable<ViagemDto>>.Success(dtos);
    }
}

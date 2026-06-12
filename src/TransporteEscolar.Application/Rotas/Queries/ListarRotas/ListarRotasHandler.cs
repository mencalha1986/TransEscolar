using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Rotas.Queries.ListarRotas;

public class ListarRotasHandler : IRequestHandler<ListarRotasQuery, IEnumerable<RotaDto>>
{
    private readonly IRotaRepository _repo;
    private readonly IMotoristaRepository _motoristaRepo;
    private readonly ITransporteRepository _transporteRepo;
    private readonly ICurrentTenantService _tenant;

    public ListarRotasHandler(IRotaRepository repo, IMotoristaRepository motoristaRepo, ITransporteRepository transporteRepo, ICurrentTenantService tenant)
        => (_repo, _motoristaRepo, _transporteRepo, _tenant) = (repo, motoristaRepo, transporteRepo, tenant);

    public async Task<IEnumerable<RotaDto>> Handle(ListarRotasQuery request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return [];

        var rotas = await _repo.ListarPorTransportadorAsync(transportadorId, ct);
        var motoristas = await _motoristaRepo.ListarPorTransportadorAsync(transportadorId, ct);
        var transportes = await _transporteRepo.ListarTodosAsync(ct);

        var motoristaMap = motoristas.ToDictionary(m => m.Id, m => m.Nome);
        var transporteMap = transportes.ToDictionary(t => t.Id, t => t.Placa);

        return rotas.Select(r => new RotaDto(
            r.Id, r.Nome, r.Turno,
            r.MotoristaId, r.MotoristaId.HasValue ? motoristaMap.GetValueOrDefault(r.MotoristaId.Value) : null,
            r.TransporteId, r.TransporteId.HasValue ? transporteMap.GetValueOrDefault(r.TransporteId.Value) : null,
            r.AlunoIds));
    }
}

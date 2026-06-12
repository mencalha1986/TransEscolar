using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Rotas.Queries.ListarRotas;

public class ListarRotasHandler : IRequestHandler<ListarRotasQuery, IEnumerable<RotaDto>>
{
    private readonly IRotaRepository _repo;
    private readonly IMotoristaRepository _motoristaRepo;
    private readonly ITransporteRepository _transporteRepo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly ICurrentTenantService _tenant;

    public ListarRotasHandler(IRotaRepository repo, IMotoristaRepository motoristaRepo, ITransporteRepository transporteRepo, IAlunoRepository alunoRepo, ICurrentTenantService tenant)
        => (_repo, _motoristaRepo, _transporteRepo, _alunoRepo, _tenant) = (repo, motoristaRepo, transporteRepo, alunoRepo, tenant);

    public async Task<IEnumerable<RotaDto>> Handle(ListarRotasQuery request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return [];

        var rotas = (await _repo.ListarPorTransportadorAsync(transportadorId, ct)).ToList();

        // Motorista logado vê apenas suas próprias rotas
        if (_tenant.MotoristaId.HasValue)
            rotas = rotas.Where(r => r.MotoristaId == _tenant.MotoristaId).ToList();

        var motoristas = await _motoristaRepo.ListarPorTransportadorAsync(transportadorId, ct);
        var transportes = await _transporteRepo.ListarTodosAsync(ct);
        var alunos = await _alunoRepo.ListarPorTransportadorAsync(transportadorId, ct);

        var motoristaMap = motoristas.ToDictionary(m => m.Id, m => m.Nome);
        var transporteMap = transportes.ToDictionary(t => t.Id, t => t.Placa);
        var alunoMap = alunos.ToDictionary(a => a.Id, a => a.Nome);

        return rotas.Select(r => new RotaDto(
            r.Id, r.Nome, r.Turno,
            r.MotoristaId, r.MotoristaId.HasValue ? motoristaMap.GetValueOrDefault(r.MotoristaId.Value) : null,
            r.TransporteId, r.TransporteId.HasValue ? transporteMap.GetValueOrDefault(r.TransporteId.Value) : null,
            r.AlunoIds.Select(id => new AlunoResumoDto(id, alunoMap.GetValueOrDefault(id, "?"))).ToList()));
    }
}

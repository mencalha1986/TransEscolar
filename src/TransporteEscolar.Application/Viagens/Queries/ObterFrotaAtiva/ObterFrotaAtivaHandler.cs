using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Queries.ObterFrotaAtiva;

public class ObterFrotaAtivaHandler : IRequestHandler<ObterFrotaAtivaQuery, Result<IEnumerable<VeiculoAtivoDto>>>
{
    private readonly IViagemRepository _viagemRepo;
    private readonly IMotoristaRepository _motoristaRepo;
    private readonly IRotaRepository _rotaRepo;
    private readonly ICurrentTenantService _tenant;

    public ObterFrotaAtivaHandler(
        IViagemRepository viagemRepo,
        IMotoristaRepository motoristaRepo,
        IRotaRepository rotaRepo,
        ICurrentTenantService tenant)
        => (_viagemRepo, _motoristaRepo, _rotaRepo, _tenant) = (viagemRepo, motoristaRepo, rotaRepo, tenant);

    public async Task<Result<IEnumerable<VeiculoAtivoDto>>> Handle(ObterFrotaAtivaQuery request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<IEnumerable<VeiculoAtivoDto>>.Failure("Usuário sem transportador associado.");

        var viagens = (await _viagemRepo.ListarAtivasPorTransportadorAsync(transportadorId, ct)).ToList();
        if (!viagens.Any())
            return Result<IEnumerable<VeiculoAtivoDto>>.Success([]);

        var motoristas = (await _motoristaRepo.ListarPorTransportadorAsync(transportadorId, ct))
            .ToDictionary(m => m.Id);

        var rotas = (await _rotaRepo.ListarPorTransportadorAsync(transportadorId, ct))
            .ToDictionary(r => r.Id);

        var resultado = viagens.Select(v =>
        {
            var motoristaNome = v.MotoristaId.HasValue && motoristas.TryGetValue(v.MotoristaId.Value, out var m)
                ? m.Nome : "Motorista não atribuído";

            var (rotaNome, totalAlunos) = v.RotaId.HasValue && rotas.TryGetValue(v.RotaId.Value, out var r)
                ? (r.Nome, r.AlunoIds.Count) : ("Rota não atribuída", 0);

            return new VeiculoAtivoDto(
                v.Id,
                v.MotoristaId,
                motoristaNome,
                v.RotaId,
                rotaNome,
                v.Turno.ToString(),
                v.LatitudeAtual,
                v.LongitudeAtual,
                v.AtualizadoEm,
                totalAlunos);
        });

        return Result<IEnumerable<VeiculoAtivoDto>>.Success(resultado);
    }
}

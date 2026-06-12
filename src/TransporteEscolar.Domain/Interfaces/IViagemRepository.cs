using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IViagemRepository : IRepository<Viagem>
{
    Task<Viagem?> ObterAtualAsync(TurnoAluno turno, DateOnly data, Guid transportadorId, CancellationToken ct = default);
    Task<Viagem?> ObterEmRotaAsync(Guid transportadorId, CancellationToken ct = default);
    Task<Viagem?> ObterEmRotaPorMotoristaAsync(Guid motoristaId, CancellationToken ct = default);
    Task<Viagem?> ObterAtualPorRotaAsync(Guid rotaId, DateOnly data, CancellationToken ct = default);
    Task<IEnumerable<Viagem>> ListarPorDataAsync(DateOnly data, Guid transportadorId, CancellationToken ct = default);
    Task<IEnumerable<Viagem>> ListarAtivasHojeAsync(CancellationToken ct = default);
    Task<IEnumerable<Viagem>> ListarAtivasPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default);
}

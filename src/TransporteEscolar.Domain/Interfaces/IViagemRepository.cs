using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IViagemRepository : IRepository<Viagem>
{
    Task<Viagem?> ObterAtualAsync(TurnoAluno turno, DateOnly data, Guid transportadorId, CancellationToken ct = default);
    Task<Viagem?> ObterEmRotaAsync(Guid transportadorId, CancellationToken ct = default);
    Task<IEnumerable<Viagem>> ListarPorDataAsync(DateOnly data, Guid transportadorId, CancellationToken ct = default);
    Task<IEnumerable<Viagem>> ListarAtivasHojeAsync(CancellationToken ct = default);
}

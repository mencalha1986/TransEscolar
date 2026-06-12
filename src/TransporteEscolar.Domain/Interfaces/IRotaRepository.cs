using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IRotaRepository : IRepository<Rota>
{
    Task<IEnumerable<Rota>> ListarPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default);
}

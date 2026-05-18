using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IPlanoRepository : IRepository<Plano>
{
    Task<IEnumerable<Plano>> ListarAtivosAsync(CancellationToken ct = default);
}

using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IFaltaRepository : IRepository<Falta>
{
    Task<IEnumerable<Falta>> ListarAsync(DateOnly? data, Guid? alunoId, CancellationToken ct = default);
    Task<Falta?> ObterPorAlunoEDataAsync(Guid alunoId, DateOnly data, CancellationToken ct = default);
    Task<IEnumerable<Guid>> ListarAlunoIdsFaltantesPorDataAsync(DateOnly data, Guid transportadorId, CancellationToken ct = default);
}

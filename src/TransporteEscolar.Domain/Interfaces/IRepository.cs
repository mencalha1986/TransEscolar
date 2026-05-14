using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Interfaces;

public interface IRepository<T> where T : Entity
{
    Task<T?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<T>> ListarTodosAsync(CancellationToken ct = default);
    Task AdicionarAsync(T entity, CancellationToken ct = default);
    void Atualizar(T entity);
    void Remover(T entity);
}

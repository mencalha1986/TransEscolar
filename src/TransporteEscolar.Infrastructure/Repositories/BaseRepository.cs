using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Common;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public abstract class BaseRepository<T> : IRepository<T> where T : Entity
{
    protected readonly AppDbContext Ctx;
    protected readonly DbSet<T> DbSet;

    protected BaseRepository(AppDbContext ctx)
    {
        Ctx = ctx;
        DbSet = ctx.Set<T>();
    }

    public async Task<T?> ObterPorIdAsync(Guid id, CancellationToken ct = default) =>
        await DbSet.FindAsync([id], ct);

    public async Task<IEnumerable<T>> ListarTodosAsync(CancellationToken ct = default) =>
        await DbSet.ToListAsync(ct);

    public async Task AdicionarAsync(T entity, CancellationToken ct = default) =>
        await DbSet.AddAsync(entity, ct);

    public void Atualizar(T entity) => DbSet.Update(entity);

    public void Remover(T entity) => DbSet.Remove(entity);
}

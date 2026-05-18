using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class PlanoRepository : BaseRepository<Plano>, IPlanoRepository
{
    public PlanoRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<IEnumerable<Plano>> ListarAtivosAsync(CancellationToken ct = default) =>
        await DbSet.Where(p => p.Ativo).ToListAsync(ct);
}

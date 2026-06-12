using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class RotaRepository : BaseRepository<Rota>, IRotaRepository
{
    public RotaRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<IEnumerable<Rota>> ListarPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.Where(r => r.TransportadorId == transportadorId).OrderBy(r => r.Nome).ToListAsync(ct);
}

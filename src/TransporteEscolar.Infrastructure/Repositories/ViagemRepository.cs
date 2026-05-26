using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class ViagemRepository : BaseRepository<Viagem>, IViagemRepository
{
    public ViagemRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<Viagem?> ObterAtualAsync(TurnoAluno turno, DateOnly data, Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(v =>
            v.TransportadorId == transportadorId &&
            v.Turno == turno &&
            v.Data == data, ct);

    public async Task<Viagem?> ObterEmRotaAsync(Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(v =>
            v.TransportadorId == transportadorId &&
            v.Status == StatusViagem.EmRota &&
            v.Data == DateOnly.FromDateTime(DateTime.UtcNow), ct);

    public async Task<IEnumerable<Viagem>> ListarPorDataAsync(DateOnly data, Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.Where(v => v.TransportadorId == transportadorId && v.Data == data)
            .OrderByDescending(v => v.IniciadaEm)
            .ToListAsync(ct);
}

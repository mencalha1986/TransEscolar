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

    public async Task<Viagem?> ObterEmRotaPorMotoristaAsync(Guid motoristaId, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(v =>
            v.MotoristaId == motoristaId &&
            v.Status == StatusViagem.EmRota &&
            v.Data == DateOnly.FromDateTime(DateTime.UtcNow), ct);

    public async Task<Viagem?> ObterAtualPorRotaAsync(Guid rotaId, DateOnly data, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(v =>
            v.RotaId == rotaId &&
            v.Data == data &&
            v.Status == StatusViagem.EmRota, ct);

    public async Task<IEnumerable<Viagem>> ListarPorDataAsync(DateOnly data, Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.Where(v => v.TransportadorId == transportadorId && v.Data == data)
            .OrderByDescending(v => v.IniciadaEm)
            .ToListAsync(ct);

    public async Task<IEnumerable<Viagem>> ListarAtivasHojeAsync(CancellationToken ct = default) =>
        await DbSet
            .Where(v => v.Status == StatusViagem.EmRota && v.Data == DateOnly.FromDateTime(DateTime.UtcNow))
            .ToListAsync(ct);

    public async Task<IEnumerable<Viagem>> ListarAtivasPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default) =>
        await DbSet
            .Where(v => v.TransportadorId == transportadorId &&
                        v.Status == StatusViagem.EmRota &&
                        v.Data == DateOnly.FromDateTime(DateTime.UtcNow))
            .ToListAsync(ct);
}

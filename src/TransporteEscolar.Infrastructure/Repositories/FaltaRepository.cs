using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class FaltaRepository : BaseRepository<Falta>, IFaltaRepository
{
    public FaltaRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<IEnumerable<Falta>> ListarAsync(DateOnly? data, Guid? alunoId, CancellationToken ct = default)
    {
        var query = DbSet.AsQueryable();
        if (data.HasValue) query = query.Where(f => f.Data == data.Value);
        if (alunoId.HasValue) query = query.Where(f => f.AlunoId == alunoId.Value);
        return await query.ToListAsync(ct);
    }

    public async Task<Falta?> ObterPorAlunoEDataAsync(Guid alunoId, DateOnly data, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(f => f.AlunoId == alunoId && f.Data == data, ct);

    public async Task<IEnumerable<Guid>> ListarAlunoIdsFaltantesPorDataAsync(DateOnly data, Guid transportadorId, CancellationToken ct = default) =>
        await DbSet
            .Where(f => f.Data == data && f.TransportadorId == transportadorId)
            .Select(f => f.AlunoId)
            .Distinct()
            .ToListAsync(ct);
}

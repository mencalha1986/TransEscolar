using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class EmailLogRepository : BaseRepository<EmailLog>, IEmailLogRepository
{
    public EmailLogRepository(AppDbContext ctx) : base(ctx) { }

    public new async Task<EmailLog?> ObterPorIdAsync(Guid id, CancellationToken ct = default) =>
        await DbSet.FindAsync([id], ct);

    public async Task<List<EmailLog>> ListarAsync(CancellationToken ct = default) =>
        await DbSet.OrderByDescending(e => e.CriadoEm).ToListAsync(ct);
}

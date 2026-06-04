using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class MensalidadeRepository : BaseRepository<Mensalidade>, IMensalidadeRepository
{
    public MensalidadeRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<IEnumerable<Mensalidade>> ListarPorAlunoAsync(Guid alunoId, CancellationToken ct = default) =>
        await DbSet.Where(m => m.AlunoId == alunoId).OrderBy(m => m.Competencia).ToListAsync(ct);

    public async Task<IEnumerable<Mensalidade>> ListarTodosComFiltroAsync(Guid? alunoId, StatusMensalidade? status, CancellationToken ct = default)
    {
        var query = DbSet.AsQueryable();
        if (alunoId.HasValue)
            query = query.Where(m => m.AlunoId == alunoId.Value);
        if (status.HasValue)
            query = query.Where(m => m.Status == status.Value);
        return await query.OrderBy(m => m.AlunoId).ThenBy(m => m.Competencia).ToListAsync(ct);
    }

    public async Task<bool> ExisteMensalidadeAsync(Guid alunoId, DateOnly competencia, CancellationToken ct = default) =>
        await DbSet.AnyAsync(m => m.AlunoId == alunoId && m.Competencia == competencia, ct);

    public async Task RemoverPorAlunoAsync(Guid alunoId, CancellationToken ct = default) =>
        await DbSet.Where(m => m.AlunoId == alunoId).ExecuteDeleteAsync(ct);

    public async Task<Mensalidade?> ObterPorPixCobrancaIdAsync(string pixCobrancaId, CancellationToken ct = default) =>
        await DbSet
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.PixCobrancaId == pixCobrancaId, ct);
}

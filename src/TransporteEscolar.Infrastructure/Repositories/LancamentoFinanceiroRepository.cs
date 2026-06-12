using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class LancamentoFinanceiroRepository : BaseRepository<LancamentoFinanceiro>, ILancamentoFinanceiroRepository
{
    public LancamentoFinanceiroRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<IEnumerable<LancamentoFinanceiro>> ListarPorTransportadorAsync(
        Guid transportadorId,
        DateTime? dataInicio,
        DateTime? dataFim,
        TipoDespesa? tipo,
        Guid? transporteId,
        CancellationToken ct = default)
    {
        var query = DbSet.Where(l => l.TransportadorId == transportadorId);

        if (dataInicio.HasValue)
            query = query.Where(l => l.DataLancamento >= dataInicio.Value.Date);

        if (dataFim.HasValue)
            query = query.Where(l => l.DataLancamento <= dataFim.Value.Date);

        if (tipo.HasValue)
            query = query.Where(l => l.Tipo == tipo.Value);

        if (transporteId.HasValue)
            query = query.Where(l => l.TransporteId == transporteId.Value);

        return await query.OrderByDescending(l => l.DataLancamento).ToListAsync(ct);
    }
}

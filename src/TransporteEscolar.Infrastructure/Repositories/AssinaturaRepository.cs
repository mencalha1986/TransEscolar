using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class AssinaturaRepository : BaseRepository<Assinatura>, IAssinaturaRepository
{
    public AssinaturaRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<Assinatura?> ObterPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(a => a.TransportadorId == transportadorId, ct);

    public async Task<IEnumerable<Assinatura>> ListarTodasAsync(CancellationToken ct = default) =>
        await DbSet.OrderByDescending(a => a.DataInicio).ToListAsync(ct);

    public async Task<IEnumerable<PagamentoAssinatura>> ListarPagamentosAsync(Guid assinaturaId, CancellationToken ct = default) =>
        await Ctx.PagamentosAssinatura.Where(p => p.AssinaturaId == assinaturaId).OrderByDescending(p => p.DataPagamento).ToListAsync(ct);

    public async Task AdicionarPagamentoAsync(PagamentoAssinatura pagamento, CancellationToken ct = default) =>
        await Ctx.PagamentosAssinatura.AddAsync(pagamento, ct);

    public async Task<Assinatura?> ObterPorPixCobrancaIdAsync(string pixCobrancaId, CancellationToken ct = default) =>
        await DbSet
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(a => a.PixCobrancaId == pixCobrancaId, ct);

    public async Task<IEnumerable<Assinatura>> ListarAtivasVencidasAsync(DateTime referencia, CancellationToken ct = default) =>
        await DbSet
            .IgnoreQueryFilters()
            .Where(a => a.Status == StatusAssinatura.Ativa && a.DataProximoVencimento < referencia)
            .ToListAsync(ct);

    public async Task<IEnumerable<Assinatura>> ListarProximasAoVencimentoAsync(DateTime referencia, int diasAviso, CancellationToken ct = default) =>
        await DbSet
            .IgnoreQueryFilters()
            .Where(a => a.Status == StatusAssinatura.Ativa
                && a.DataProximoVencimento.Date >= referencia.Date
                && a.DataProximoVencimento.Date <= referencia.AddDays(diasAviso).Date)
            .ToListAsync(ct);

    public async Task<bool> ExistePorPlanoAsync(Guid planoId, CancellationToken ct = default) =>
        await DbSet.IgnoreQueryFilters().AnyAsync(a => a.PlanoId == planoId, ct);

    public async Task<Dictionary<Guid, int>> ContarClientesPorPlanoAsync(CancellationToken ct = default) =>
        await DbSet
            .IgnoreQueryFilters()
            .GroupBy(a => a.PlanoId)
            .Select(g => new { PlanoId = g.Key, Total = g.Count() })
            .ToDictionaryAsync(x => x.PlanoId, x => x.Total, ct);
}

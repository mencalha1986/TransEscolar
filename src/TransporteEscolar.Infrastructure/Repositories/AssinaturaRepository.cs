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
}

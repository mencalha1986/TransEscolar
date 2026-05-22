using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class TransportadorRepository : BaseRepository<Transportador>, ITransportadorRepository
{
    public TransportadorRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<bool> ExisteEmailAsync(string email, CancellationToken ct = default) =>
        await DbSet.IgnoreQueryFilters().AnyAsync(t => t.Email == email.ToLowerInvariant(), ct);

    public async Task<bool> ExisteCpfCnpjAsync(string cpfCnpj, CancellationToken ct = default) =>
        await DbSet.IgnoreQueryFilters().AnyAsync(t => t.CpfCnpj == cpfCnpj, ct);

    public async Task<int> ContarAlunosAsync(Guid transportadorId, CancellationToken ct = default) =>
        await Ctx.Alunos.IgnoreQueryFilters().CountAsync(a => a.TransportadorId == transportadorId, ct);

    public async Task DeletarEmCascataAsync(Guid id, CancellationToken ct = default)
    {
        var assinaturaIds = await Ctx.Assinaturas
            .IgnoreQueryFilters()
            .Where(a => a.TransportadorId == id)
            .Select(a => a.Id)
            .ToListAsync(ct);

        if (assinaturaIds.Count > 0)
            await Ctx.PagamentosAssinatura
                .Where(p => assinaturaIds.Contains(p.AssinaturaId))
                .ExecuteDeleteAsync(ct);

        await Ctx.Assinaturas.IgnoreQueryFilters().Where(e => e.TransportadorId == id).ExecuteDeleteAsync(ct);
        await Ctx.Recados.IgnoreQueryFilters().Where(e => e.TransportadorId == id).ExecuteDeleteAsync(ct);
        await Ctx.CheckIns.IgnoreQueryFilters().Where(e => e.TransportadorId == id).ExecuteDeleteAsync(ct);
        await Ctx.Mensalidades.IgnoreQueryFilters().Where(e => e.TransportadorId == id).ExecuteDeleteAsync(ct);
        await Ctx.Transportes.IgnoreQueryFilters().Where(e => e.TransportadorId == id).ExecuteDeleteAsync(ct);
        await Ctx.Alunos.IgnoreQueryFilters().Where(e => e.TransportadorId == id).ExecuteDeleteAsync(ct);
        await Ctx.Responsaveis.IgnoreQueryFilters().Where(e => e.TransportadorId == id).ExecuteDeleteAsync(ct);
        await Ctx.Escolas.IgnoreQueryFilters().Where(e => e.TransportadorId == id).ExecuteDeleteAsync(ct);
        await Ctx.Usuarios.IgnoreQueryFilters().Where(e => e.TransportadorId == id).ExecuteDeleteAsync(ct);
        await DbSet.Where(e => e.Id == id).ExecuteDeleteAsync(ct);
    }
}

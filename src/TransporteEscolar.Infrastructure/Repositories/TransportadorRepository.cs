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
}

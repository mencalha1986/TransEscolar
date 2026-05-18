using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class ResponsavelRepository : BaseRepository<Responsavel>, IResponsavelRepository
{
    public ResponsavelRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<Responsavel?> ObterPorCPFAsync(string cpf, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(r => r.CPF.Numero == cpf, ct);

    public async Task<IEnumerable<Responsavel>> ListarPorIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default) =>
        await DbSet.Where(r => ids.Contains(r.Id)).ToListAsync(ct);
}

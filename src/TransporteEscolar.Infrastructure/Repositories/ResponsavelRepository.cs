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
}

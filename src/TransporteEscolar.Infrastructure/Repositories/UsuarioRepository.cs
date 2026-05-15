using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class UsuarioRepository : BaseRepository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<bool> ExisteEmailAsync(string email, CancellationToken ct = default) =>
        await DbSet.AnyAsync(u => u.Email == email.ToLowerInvariant(), ct);
}

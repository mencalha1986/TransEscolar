using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class UsuarioRepository : BaseRepository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken ct = default) =>
        await DbSet.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<bool> ExisteEmailAsync(string email, CancellationToken ct = default) =>
        await DbSet.IgnoreQueryFilters().AnyAsync(u => u.Email == email.ToLowerInvariant(), ct);

    public async Task<IEnumerable<Usuario>> ListarPorEmailsAsync(IEnumerable<string> emails, CancellationToken ct = default) =>
        await DbSet.IgnoreQueryFilters().Where(u => emails.Contains(u.Email)).ToListAsync(ct);

    public async Task<IEnumerable<Usuario>> ListarPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.IgnoreQueryFilters()
            .Where(u => u.TransportadorId == transportadorId && u.Perfil != PerfilUsuario.Responsavel)
            .ToListAsync(ct);
}

using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class DispositivoTokenRepository : IDispositivoTokenRepository
{
    private readonly AppDbContext _ctx;

    public DispositivoTokenRepository(AppDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<string>> ObterTokensPorUsuariosAsync(IEnumerable<Guid> usuarioIds, CancellationToken ct = default) =>
        await _ctx.DispositivoTokens
            .Where(d => usuarioIds.Contains(d.UsuarioId))
            .Select(d => d.Token)
            .ToListAsync(ct);

    public async Task SalvarOuAtualizarAsync(Guid usuarioId, Guid transportadorId, string token, string plataforma, CancellationToken ct = default)
    {
        var existente = await _ctx.DispositivoTokens
            .FirstOrDefaultAsync(d => d.UsuarioId == usuarioId && d.Plataforma == plataforma.ToLowerInvariant(), ct);

        if (existente is not null)
        {
            existente.AtualizarToken(token);
            _ctx.DispositivoTokens.Update(existente);
        }
        else
        {
            await _ctx.DispositivoTokens.AddAsync(DispositivoToken.Criar(usuarioId, transportadorId, token, plataforma), ct);
        }

        await _ctx.SaveChangesAsync(ct);
    }

    public async Task RemoverTokenAsync(string token, CancellationToken ct = default)
    {
        var dt = await _ctx.DispositivoTokens.FirstOrDefaultAsync(d => d.Token == token, ct);
        if (dt is not null)
        {
            _ctx.DispositivoTokens.Remove(dt);
            await _ctx.SaveChangesAsync(ct);
        }
    }
}

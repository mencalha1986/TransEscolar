using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class MotoristaRepository : BaseRepository<Motorista>, IMotoristaRepository
{
    public MotoristaRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<bool> ExisteCpfAsync(string cpf, Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.AnyAsync(m => m.Cpf == cpf && m.TransportadorId == transportadorId, ct);

    public async Task<IEnumerable<Motorista>> ListarPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.Where(m => m.TransportadorId == transportadorId).OrderBy(m => m.Nome).ToListAsync(ct);

    public async Task<Motorista?> ObterPorUsuarioIdAsync(Guid usuarioId, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(m => m.UsuarioId == usuarioId, ct);
}

using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class TransporteRepository : BaseRepository<Domain.Entities.Transporte>, ITransporteRepository
{
    public TransporteRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<Transporte?> ObterPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.FirstOrDefaultAsync(t => t.TransportadorId == transportadorId, ct);

    public async Task<IEnumerable<CheckIn>> ListarCheckInsAsync(CancellationToken ct = default) =>
        await Ctx.CheckIns.OrderByDescending(c => c.HoraRegistro).ToListAsync(ct);

    public async Task<IEnumerable<CheckIn>> ListarCheckInsPorAlunoAsync(Guid alunoId, CancellationToken ct = default) =>
        await Ctx.CheckIns.Where(c => c.AlunoId == alunoId)
            .OrderByDescending(c => c.HoraRegistro).ToListAsync(ct);

    public async Task AdicionarCheckInAsync(CheckIn checkIn, CancellationToken ct = default) =>
        await Ctx.CheckIns.AddAsync(checkIn, ct);
}

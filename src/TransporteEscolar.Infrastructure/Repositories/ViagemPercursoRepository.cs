using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class ViagemPercursoRepository : IViagemPercursoRepository
{
    private readonly AppDbContext _ctx;

    public ViagemPercursoRepository(AppDbContext ctx) => _ctx = ctx;

    public void Adicionar(ViagemPercurso percurso) => _ctx.ViagemPercursos.Add(percurso);

    public async Task<IEnumerable<ViagemPercurso>> ListarPorViagemAsync(Guid viagemId, CancellationToken ct = default) =>
        await _ctx.ViagemPercursos
            .Where(p => p.ViagemId == viagemId)
            .OrderBy(p => p.Timestamp)
            .ToListAsync(ct);
}

using Microsoft.EntityFrameworkCore;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class AlunoRepository : BaseRepository<Aluno>, IAlunoRepository
{
    public AlunoRepository(AppDbContext ctx) : base(ctx) { }

    public async Task<IEnumerable<Aluno>> ListarPorEscolaAsync(Guid escolaId, CancellationToken ct = default) =>
        await DbSet.Where(a => a.EscolaId == escolaId).ToListAsync(ct);

    public async Task<IEnumerable<Aluno>> ListarPorResponsavelAsync(Guid responsavelId, CancellationToken ct = default) =>
        await DbSet.Where(a => EF.Property<List<Guid>>(a, "_responsavelIds").Contains(responsavelId)).ToListAsync(ct);

    public async Task<int> ContarPorResponsavelAsync(Guid responsavelId, CancellationToken ct = default) =>
        await DbSet.CountAsync(a => EF.Property<List<Guid>>(a, "_responsavelIds").Contains(responsavelId), ct);

    public async Task<IEnumerable<Aluno>> ListarPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default) =>
        await DbSet.Where(a => a.TransportadorId == transportadorId).ToListAsync(ct);
}

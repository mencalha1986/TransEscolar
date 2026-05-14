using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class EscolaRepository : BaseRepository<Escola>, IEscolaRepository
{
    public EscolaRepository(AppDbContext ctx) : base(ctx) { }
}

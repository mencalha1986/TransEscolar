using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Infrastructure.Persistence;

namespace TransporteEscolar.Infrastructure.Repositories;

public class RecadoRepository : BaseRepository<Recado>, IRecadoRepository
{
    public RecadoRepository(AppDbContext ctx) : base(ctx) { }
}

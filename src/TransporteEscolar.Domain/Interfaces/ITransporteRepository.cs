using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface ITransporteRepository : IRepository<Transporte>
{
    Task<IEnumerable<CheckIn>> ListarCheckInsPorAlunoAsync(Guid alunoId, CancellationToken ct = default);
    Task AdicionarCheckInAsync(CheckIn checkIn, CancellationToken ct = default);
}

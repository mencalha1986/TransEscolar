using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface ITransporteRepository : IRepository<Transporte>
{
    Task<Transporte?> ObterPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default);
    Task<IEnumerable<CheckIn>> ListarCheckInsAsync(CancellationToken ct = default);
    Task<IEnumerable<CheckIn>> ListarCheckInsPorAlunoAsync(Guid alunoId, CancellationToken ct = default);
    Task AdicionarCheckInAsync(CheckIn checkIn, CancellationToken ct = default);
    Task RemoverCheckInsPorAlunoAsync(Guid alunoId, CancellationToken ct = default);
}

using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IMotoristaRepository : IRepository<Motorista>
{
    Task<bool> ExisteCpfAsync(string cpf, Guid transportadorId, CancellationToken ct = default);
    Task<IEnumerable<Motorista>> ListarPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default);
    Task<Motorista?> ObterPorUsuarioIdAsync(Guid usuarioId, CancellationToken ct = default);
}

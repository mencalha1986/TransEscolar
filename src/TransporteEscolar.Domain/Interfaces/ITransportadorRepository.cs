using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface ITransportadorRepository : IRepository<Transportador>
{
    Task<bool> ExisteEmailAsync(string email, CancellationToken ct = default);
    Task<bool> ExisteCpfCnpjAsync(string cpfCnpj, CancellationToken ct = default);
    Task<int> ContarAlunosAsync(Guid transportadorId, CancellationToken ct = default);
}

using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IUsuarioRepository : IRepository<Usuario>
{
    Task<Usuario?> ObterPorEmailAsync(string email, CancellationToken ct = default);
    Task<bool> ExisteEmailAsync(string email, CancellationToken ct = default);
    Task<IEnumerable<Usuario>> ListarPorEmailsAsync(IEnumerable<string> emails, CancellationToken ct = default);
    Task<IEnumerable<Usuario>> ListarPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default);
}

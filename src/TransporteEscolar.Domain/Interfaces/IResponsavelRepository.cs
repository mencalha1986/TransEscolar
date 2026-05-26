using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IResponsavelRepository : IRepository<Responsavel>
{
    Task<Responsavel?> ObterPorCPFAsync(string cpf, CancellationToken ct = default);
    Task<Responsavel?> ObterPorEmailAsync(string email, CancellationToken ct = default);
    Task<IEnumerable<Responsavel>> ListarPorIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default);
}

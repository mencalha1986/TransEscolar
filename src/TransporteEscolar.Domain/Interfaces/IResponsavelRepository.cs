using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IResponsavelRepository : IRepository<Responsavel>
{
    Task<Responsavel?> ObterPorCPFAsync(string cpf, CancellationToken ct = default);
}

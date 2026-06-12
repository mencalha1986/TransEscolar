using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IAlunoRepository : IRepository<Aluno>
{
    Task<IEnumerable<Aluno>> ListarPorEscolaAsync(Guid escolaId, CancellationToken ct = default);
    Task<IEnumerable<Aluno>> ListarPorResponsavelAsync(Guid responsavelId, CancellationToken ct = default);
    Task<int> ContarPorResponsavelAsync(Guid responsavelId, CancellationToken ct = default);
    Task<IEnumerable<Aluno>> ListarPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default);
}

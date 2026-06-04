using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IMensalidadeRepository : IRepository<Mensalidade>
{
    Task<IEnumerable<Mensalidade>> ListarPorAlunoAsync(Guid alunoId, CancellationToken ct = default);
    Task<IEnumerable<Mensalidade>> ListarTodosComFiltroAsync(Guid? alunoId, StatusMensalidade? status, CancellationToken ct = default);
    Task<bool> ExisteMensalidadeAsync(Guid alunoId, DateOnly competencia, CancellationToken ct = default);
    Task RemoverPorAlunoAsync(Guid alunoId, CancellationToken ct = default);
    Task<Mensalidade?> ObterPorPixCobrancaIdAsync(string pixCobrancaId, CancellationToken ct = default);
}

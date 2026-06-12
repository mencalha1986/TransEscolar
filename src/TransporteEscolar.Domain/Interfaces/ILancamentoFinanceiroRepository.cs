using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface ILancamentoFinanceiroRepository : IRepository<LancamentoFinanceiro>
{
    Task<IEnumerable<LancamentoFinanceiro>> ListarPorTransportadorAsync(
        Guid transportadorId,
        DateTime? dataInicio,
        DateTime? dataFim,
        TipoDespesa? tipo,
        Guid? transporteId,
        CancellationToken ct = default);
}

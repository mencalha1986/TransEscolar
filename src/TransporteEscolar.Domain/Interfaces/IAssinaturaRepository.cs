using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IAssinaturaRepository : IRepository<Assinatura>
{
    Task<Assinatura?> ObterPorTransportadorAsync(Guid transportadorId, CancellationToken ct = default);
    Task<IEnumerable<Assinatura>> ListarTodasAsync(CancellationToken ct = default);
    Task<IEnumerable<PagamentoAssinatura>> ListarPagamentosAsync(Guid assinaturaId, CancellationToken ct = default);
    Task AdicionarPagamentoAsync(PagamentoAssinatura pagamento, CancellationToken ct = default);
}

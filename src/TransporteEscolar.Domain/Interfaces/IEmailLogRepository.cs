using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IEmailLogRepository
{
    Task AdicionarAsync(EmailLog log, CancellationToken ct = default);
    Task<EmailLog?> ObterPorIdAsync(Guid id, CancellationToken ct = default);
    Task<List<EmailLog>> ListarAsync(CancellationToken ct = default);
}

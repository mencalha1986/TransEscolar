namespace TransporteEscolar.Domain.Interfaces;

public interface IDispositivoTokenRepository
{
    Task<IEnumerable<string>> ObterTokensPorUsuariosAsync(IEnumerable<Guid> usuarioIds, CancellationToken ct = default);
    Task SalvarOuAtualizarAsync(Guid usuarioId, Guid transportadorId, string token, string plataforma, CancellationToken ct = default);
    Task RemoverTokenAsync(string token, CancellationToken ct = default);
}

using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Domain.Interfaces;

public interface IViagemPercursoRepository
{
    void Adicionar(ViagemPercurso percurso);
    Task<IEnumerable<ViagemPercurso>> ListarPorViagemAsync(Guid viagemId, CancellationToken ct = default);
}

using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Queries.ListarTransportadores;

public class ListarTransportadoresHandler : IRequestHandler<ListarTransportadoresQuery, IEnumerable<TransportadorResumoDto>>
{
    private readonly ITransportadorRepository _repo;
    private readonly IAssinaturaRepository _assinaturaRepo;
    private readonly IPlanoRepository _planoRepo;

    public ListarTransportadoresHandler(ITransportadorRepository repo, IAssinaturaRepository assinaturaRepo, IPlanoRepository planoRepo)
        => (_repo, _assinaturaRepo, _planoRepo) = (repo, assinaturaRepo, planoRepo);

    public async Task<IEnumerable<TransportadorResumoDto>> Handle(ListarTransportadoresQuery request, CancellationToken ct)
    {
        var transportadores = await _repo.ListarTodosAsync(ct);
        var assinaturas = await _assinaturaRepo.ListarTodasAsync(ct);
        var planos = await _planoRepo.ListarTodosAsync(ct);

        var planosPorTransportador = assinaturas
            .Join(planos, a => a.PlanoId, p => p.Id, (a, p) => (a.TransportadorId, p.Nome))
            .ToDictionary(x => x.TransportadorId, x => x.Nome);

        return transportadores.Select(t => new TransportadorResumoDto(
            t.Id, t.NomeEmpresa, t.NomeContato, t.Email, t.Status, t.CriadoEm,
            planosPorTransportador.GetValueOrDefault(t.Id), t.Vitalicio));
    }
}

using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Queries.ListarTransportadores;

public class ListarTransportadoresHandler : IRequestHandler<ListarTransportadoresQuery, IEnumerable<TransportadorResumoDto>>
{
    private readonly ITransportadorRepository _repo;

    public ListarTransportadoresHandler(ITransportadorRepository repo) => _repo = repo;

    public async Task<IEnumerable<TransportadorResumoDto>> Handle(ListarTransportadoresQuery request, CancellationToken ct)
    {
        var transportadores = await _repo.ListarTodosAsync(ct);
        return transportadores.Select(t => new TransportadorResumoDto(
            t.Id, t.NomeEmpresa, t.NomeContato, t.Email, t.Status, t.CriadoEm));
    }
}

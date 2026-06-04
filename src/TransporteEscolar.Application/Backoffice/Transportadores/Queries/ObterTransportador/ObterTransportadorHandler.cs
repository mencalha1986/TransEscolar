using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Queries.ObterTransportador;

public class ObterTransportadorHandler : IRequestHandler<ObterTransportadorQuery, TransportadorDetalheDto?>
{
    private readonly ITransportadorRepository _repo;

    public ObterTransportadorHandler(ITransportadorRepository repo) => _repo = repo;

    public async Task<TransportadorDetalheDto?> Handle(ObterTransportadorQuery request, CancellationToken ct)
    {
        var t = await _repo.ObterPorIdAsync(request.Id, ct);
        if (t is null) return null;

        var totalAlunos = await _repo.ContarAlunosAsync(t.Id, ct);

        return new TransportadorDetalheDto(
            t.Id, t.NomeEmpresa, t.NomeContato, t.CpfCnpj, t.Email, t.Telefone,
            t.Status, totalAlunos, t.CriadoEm, t.Vitalicio);
    }
}

using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Queries.ListarAssinaturas;

public class ListarAssinaturasHandler : IRequestHandler<ListarAssinaturasQuery, IEnumerable<AssinaturaDto>>
{
    private readonly IAssinaturaRepository _repo;

    public ListarAssinaturasHandler(IAssinaturaRepository repo) => _repo = repo;

    public async Task<IEnumerable<AssinaturaDto>> Handle(ListarAssinaturasQuery request, CancellationToken ct)
    {
        var assinaturas = await _repo.ListarTodasAsync(ct);
        return assinaturas.Select(a => new AssinaturaDto(
            a.Id, a.TransportadorId, a.PlanoId, a.ValorContratado, a.Status, a.DataProximoVencimento));
    }
}

public class ListarPagamentosAssinaturaHandler : IRequestHandler<ListarPagamentosAssinaturaQuery, IEnumerable<PagamentoAssinaturaDto>>
{
    private readonly IAssinaturaRepository _repo;

    public ListarPagamentosAssinaturaHandler(IAssinaturaRepository repo) => _repo = repo;

    public async Task<IEnumerable<PagamentoAssinaturaDto>> Handle(ListarPagamentosAssinaturaQuery request, CancellationToken ct)
    {
        var pagamentos = await _repo.ListarPagamentosAsync(request.AssinaturaId, ct);
        return pagamentos.Select(p => new PagamentoAssinaturaDto(
            p.Id, p.ValorPago, p.CompetenciaMes, p.CompetenciaAno, p.DataPagamento, p.Observacao));
    }
}

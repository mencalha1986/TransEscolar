using MediatR;
using TransporteEscolar.Domain.Interfaces;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Queries.ListarAssinaturas;

public class ListarAssinaturasHandler : IRequestHandler<ListarAssinaturasQuery, IEnumerable<AssinaturaDto>>
{
    private readonly IAssinaturaRepository _repo;
    private readonly ITransportadorRepository _transportadorRepo;
    private readonly IPlanoRepository _planoRepo;

    public ListarAssinaturasHandler(IAssinaturaRepository repo, ITransportadorRepository transportadorRepo, IPlanoRepository planoRepo)
        => (_repo, _transportadorRepo, _planoRepo) = (repo, transportadorRepo, planoRepo);

    public async Task<IEnumerable<AssinaturaDto>> Handle(ListarAssinaturasQuery request, CancellationToken ct)
    {
        var assinaturas = await _repo.ListarTodasAsync(ct);
        var transportadores = await _transportadorRepo.ListarTodosAsync(ct);
        var planos = await _planoRepo.ListarTodosAsync(ct);

        var nomesTransportador = transportadores.ToDictionary(t => t.Id, t => t.NomeEmpresa);
        var nomesPlano = planos.ToDictionary(p => p.Id, p => p.Nome);

        return assinaturas.Select(a => new AssinaturaDto(
            a.Id, a.TransportadorId,
            nomesTransportador.GetValueOrDefault(a.TransportadorId, "—"),
            a.PlanoId,
            nomesPlano.GetValueOrDefault(a.PlanoId, "—"),
            a.ValorContratado, a.Status, a.DataProximoVencimento));
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

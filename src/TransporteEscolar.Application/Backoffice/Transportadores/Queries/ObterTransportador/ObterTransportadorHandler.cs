using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Queries.ObterTransportador;

public class ObterTransportadorHandler : IRequestHandler<ObterTransportadorQuery, TransportadorDetalheDto?>
{
    private readonly ITransportadorRepository _repo;
    private readonly IAssinaturaRepository _assinaturaRepo;
    private readonly IPlanoRepository _planoRepo;

    public ObterTransportadorHandler(ITransportadorRepository repo, IAssinaturaRepository assinaturaRepo, IPlanoRepository planoRepo)
        => (_repo, _assinaturaRepo, _planoRepo) = (repo, assinaturaRepo, planoRepo);

    public async Task<TransportadorDetalheDto?> Handle(ObterTransportadorQuery request, CancellationToken ct)
    {
        var t = await _repo.ObterPorIdAsync(request.Id, ct);
        if (t is null) return null;

        var totalAlunos = await _repo.ContarAlunosAsync(t.Id, ct);
        var assinatura = await _assinaturaRepo.ObterPorTransportadorAsync(t.Id, ct);
        string? nomePlano = null;
        if (assinatura is not null)
        {
            var plano = await _planoRepo.ObterPorIdAsync(assinatura.PlanoId, ct);
            nomePlano = plano?.Nome;
        }

        return new TransportadorDetalheDto(
            t.Id, t.NomeEmpresa, t.NomeContato, t.CpfCnpj, t.Email, t.Telefone,
            t.Status, totalAlunos, t.CriadoEm, t.Vitalicio, nomePlano, t.TipoOperacao);
    }
}

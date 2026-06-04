using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Planos.Queries.ListarPlanos;

public class ListarPlanosHandler : IRequestHandler<ListarPlanosQuery, IEnumerable<PlanoDto>>
{
    private readonly IPlanoRepository _repo;
    private readonly IAssinaturaRepository _assinaturaRepo;

    public ListarPlanosHandler(IPlanoRepository repo, IAssinaturaRepository assinaturaRepo)
        => (_repo, _assinaturaRepo) = (repo, assinaturaRepo);

    public async Task<IEnumerable<PlanoDto>> Handle(ListarPlanosQuery request, CancellationToken ct)
    {
        var planos = await _repo.ListarTodosAsync(ct);
        var contagens = await _assinaturaRepo.ContarClientesPorPlanoAsync(ct);
        return planos.Select(p => new PlanoDto(
            p.Id, p.Nome, p.Descricao, p.PrecoMensal, p.LimiteAlunos, p.LimiteRotas, p.RetencaoHistoricoDias, p.Ativo,
            contagens.GetValueOrDefault(p.Id, 0)));
    }
}

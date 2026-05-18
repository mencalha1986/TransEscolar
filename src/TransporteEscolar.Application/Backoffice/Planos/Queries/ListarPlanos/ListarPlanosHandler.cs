using MediatR;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Planos.Queries.ListarPlanos;

public class ListarPlanosHandler : IRequestHandler<ListarPlanosQuery, IEnumerable<PlanoDto>>
{
    private readonly IPlanoRepository _repo;

    public ListarPlanosHandler(IPlanoRepository repo) => _repo = repo;

    public async Task<IEnumerable<PlanoDto>> Handle(ListarPlanosQuery request, CancellationToken ct)
    {
        var planos = await _repo.ListarTodosAsync(ct);
        return planos.Select(p => new PlanoDto(p.Id, p.Nome, p.Descricao, p.PrecoMensal, p.LimiteAlunos, p.Ativo));
    }
}

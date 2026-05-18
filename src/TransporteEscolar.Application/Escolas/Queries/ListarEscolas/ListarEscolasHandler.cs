using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Escolas.Queries.ListarEscolas;

public class ListarEscolasHandler : IRequestHandler<ListarEscolasQuery, Result<IEnumerable<EscolaResumoDto>>>
{
    private readonly IEscolaRepository _repo;

    public ListarEscolasHandler(IEscolaRepository repo) => _repo = repo;

    public async Task<Result<IEnumerable<EscolaResumoDto>>> Handle(ListarEscolasQuery request, CancellationToken ct)
    {
        var escolas = await _repo.ListarTodosAsync(ct);
        var dtos = escolas.Select(e => new EscolaResumoDto(
            e.Id, e.Nome, e.Endereco.Cidade, e.Telefone,
            e.Endereco.Logradouro, e.Endereco.Numero, e.Endereco.Bairro, e.Endereco.Estado, e.Endereco.CEP));
        return Result<IEnumerable<EscolaResumoDto>>.Success(dtos);
    }
}

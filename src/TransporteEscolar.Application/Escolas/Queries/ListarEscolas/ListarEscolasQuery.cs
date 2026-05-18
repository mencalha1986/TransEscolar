using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Escolas.Queries.ListarEscolas;

public record EscolaResumoDto(Guid Id, string Nome, string Cidade, string Telefone,
    string Logradouro, string Numero, string Bairro, string Estado, string Cep);

public record ListarEscolasQuery : IRequest<Result<IEnumerable<EscolaResumoDto>>>;

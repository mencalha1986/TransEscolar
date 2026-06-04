using MediatR;

namespace TransporteEscolar.Application.Backoffice.Planos.Queries.ListarPlanos;

public record PlanoDto(Guid Id, string Nome, string? Descricao, decimal PrecoMensal, int? LimiteAlunos, int? LimiteRotas, int? RetencaoHistoricoDias, bool Ativo, int TotalClientes);

public record ListarPlanosQuery : IRequest<IEnumerable<PlanoDto>>;

using MediatR;

namespace TransporteEscolar.Application.Backoffice.Planos.Queries.ListarPlanos;

public record PlanoDto(Guid Id, string Nome, string? Descricao, decimal PrecoMensal, int? LimiteAlunos, bool Ativo);

public record ListarPlanosQuery : IRequest<IEnumerable<PlanoDto>>;

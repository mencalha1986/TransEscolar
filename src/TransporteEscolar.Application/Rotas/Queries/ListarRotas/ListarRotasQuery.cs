using MediatR;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Rotas.Queries.ListarRotas;

public record RotaDto(Guid Id, string Nome, TurnoAluno Turno, Guid? MotoristaId, string? NomeMotorista, Guid? TransporteId, string? PlacaTransporte, IReadOnlyList<Guid> AlunoIds);

public record ListarRotasQuery : IRequest<IEnumerable<RotaDto>>;

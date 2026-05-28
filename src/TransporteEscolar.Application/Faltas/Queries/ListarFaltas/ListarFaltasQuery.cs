using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Faltas.Queries.ListarFaltas;

public record FaltaDto(Guid Id, Guid AlunoId, string AlunoNome, DateOnly Data, string? Motivo, DateTime CriadoEm, bool CienciaTransportador, DateTime? CienciaDadaEm);

public record ListarFaltasQuery(DateOnly? Data, Guid? AlunoId) : IRequest<Result<IEnumerable<FaltaDto>>>;

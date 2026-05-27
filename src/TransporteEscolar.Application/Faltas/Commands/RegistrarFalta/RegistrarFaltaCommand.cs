using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Faltas.Queries.ListarFaltas;

namespace TransporteEscolar.Application.Faltas.Commands.RegistrarFalta;

public record RegistrarFaltaCommand(Guid AlunoId, DateOnly Data, string? Motivo) : IRequest<Result<FaltaDto>>;

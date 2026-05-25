using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Viagens.Commands.IniciarViagem;

public record IniciarViagemCommand(TurnoAluno Turno) : IRequest<Result<Guid>>;

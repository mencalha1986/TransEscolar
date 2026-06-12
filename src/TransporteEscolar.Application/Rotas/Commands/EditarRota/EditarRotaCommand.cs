using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Rotas.Commands.EditarRota;

public record EditarRotaCommand(Guid Id, string Nome, TurnoAluno Turno, Guid? MotoristaId, Guid? TransporteId) : IRequest<Result<bool>>;

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Rotas.Commands.CriarRota;

public record CriarRotaCommand(string Nome, TurnoAluno Turno, Guid? MotoristaId, Guid? TransporteId) : IRequest<Result<Guid>>;

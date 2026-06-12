using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Motoristas.Commands.CriarAcessoMotorista;

public record CriarAcessoMotoristaCommand(Guid MotoristaId, string Email) : IRequest<Result<bool>>;

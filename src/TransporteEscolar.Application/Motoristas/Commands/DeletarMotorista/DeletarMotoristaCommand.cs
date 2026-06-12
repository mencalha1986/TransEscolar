using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Motoristas.Commands.DeletarMotorista;

public record DeletarMotoristaCommand(Guid Id) : IRequest<Result<bool>>;

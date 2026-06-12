using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Motoristas.Commands.EditarMotorista;

public record EditarMotoristaCommand(Guid Id, string Nome, string? Cnh, string? Telefone) : IRequest<Result<bool>>;

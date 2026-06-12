using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Motoristas.Commands.CriarMotorista;

public record CriarMotoristaCommand(
    string Nome,
    string Cpf,
    string? Cnh,
    string? Telefone
) : IRequest<Result<Guid>>;

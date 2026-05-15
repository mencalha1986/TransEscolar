using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Auth.Commands.LoginUsuario;

public record LoginUsuarioCommand(string Email, string Senha) : IRequest<Result<string>>;

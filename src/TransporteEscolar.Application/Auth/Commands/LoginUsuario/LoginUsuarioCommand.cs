using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Auth.Commands.LoginUsuario;

public record LoginResponse(string Token, bool MustChangePassword);

public record LoginUsuarioCommand(string Email, string Senha) : IRequest<Result<LoginResponse>>;

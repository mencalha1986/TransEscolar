using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Auth.Commands.RegistrarUsuario;

public record RegistrarUsuarioCommand(
    string Nome,
    string Email,
    string Senha,
    PerfilUsuario Perfil) : IRequest<Result<Guid>>;

using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Auth.Commands.AlterarSenha;

public record AlterarSenhaCommand(Guid UsuarioId, string SenhaAtual, string NovaSenha) : IRequest<Result<bool>>;

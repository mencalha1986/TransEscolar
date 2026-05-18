using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Auth.Commands.LoginUsuario;

public class LoginUsuarioHandler : IRequestHandler<LoginUsuarioCommand, Result<LoginResponse>>
{
    private readonly IUsuarioRepository _repo;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokenService;

    public LoginUsuarioHandler(IUsuarioRepository repo, IPasswordHasher hasher, ITokenService tokenService)
        => (_repo, _hasher, _tokenService) = (repo, hasher, tokenService);

    public async Task<Result<LoginResponse>> Handle(LoginUsuarioCommand request, CancellationToken ct)
    {
        var usuario = await _repo.ObterPorEmailAsync(request.Email.ToLowerInvariant(), ct);
        if (usuario is null || !_hasher.Verify(request.Senha, usuario.PasswordHash))
            return Result<LoginResponse>.Failure("Credenciais inválidas.");

        var token = _tokenService.GerarToken(usuario);
        return Result<LoginResponse>.Success(new LoginResponse(token, usuario.MustChangePassword));
    }
}

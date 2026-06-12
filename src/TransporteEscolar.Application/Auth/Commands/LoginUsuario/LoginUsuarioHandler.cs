using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Auth.Commands.LoginUsuario;

public class LoginUsuarioHandler : IRequestHandler<LoginUsuarioCommand, Result<LoginResponse>>
{
    private readonly IUsuarioRepository _repo;
    private readonly ITransportadorRepository _transportadorRepo;
    private readonly IMotoristaRepository _motoristaRepo;
    private readonly IPasswordHasher _hasher;
    private readonly ITokenService _tokenService;

    public LoginUsuarioHandler(IUsuarioRepository repo, ITransportadorRepository transportadorRepo, IMotoristaRepository motoristaRepo, IPasswordHasher hasher, ITokenService tokenService)
        => (_repo, _transportadorRepo, _motoristaRepo, _hasher, _tokenService) = (repo, transportadorRepo, motoristaRepo, hasher, tokenService);

    public async Task<Result<LoginResponse>> Handle(LoginUsuarioCommand request, CancellationToken ct)
    {
        var usuario = await _repo.ObterPorEmailAsync(request.Email.ToLowerInvariant(), ct);
        if (usuario is null || !_hasher.Verify(request.Senha, usuario.PasswordHash))
            return Result<LoginResponse>.Failure("Credenciais inválidas.");

        Domain.Entities.TipoOperacao? tipoOperacao = null;
        bool? moduloFinanceiroAtivo = null;
        if (usuario.TransportadorId.HasValue)
        {
            var transportador = await _transportadorRepo.ObterPorIdAsync(usuario.TransportadorId.Value, ct);
            tipoOperacao = transportador?.TipoOperacao;
            moduloFinanceiroAtivo = transportador?.ModuloFinanceiroAtivo;
        }

        var motorista = await _motoristaRepo.ObterPorUsuarioIdAsync(usuario.Id, ct);

        var token = _tokenService.GerarToken(usuario, tipoOperacao, motorista?.Id, moduloFinanceiroAtivo);
        return Result<LoginResponse>.Success(new LoginResponse(token, usuario.MustChangePassword));
    }
}

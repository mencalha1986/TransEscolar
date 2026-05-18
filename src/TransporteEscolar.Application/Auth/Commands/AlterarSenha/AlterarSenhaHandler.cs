using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Auth.Commands.AlterarSenha;

public class AlterarSenhaHandler : IRequestHandler<AlterarSenhaCommand, Result<bool>>
{
    private readonly IUsuarioRepository _repo;
    private readonly IPasswordHasher _hasher;
    private readonly IUnitOfWork _uow;

    public AlterarSenhaHandler(IUsuarioRepository repo, IPasswordHasher hasher, IUnitOfWork uow)
        => (_repo, _hasher, _uow) = (repo, hasher, uow);

    public async Task<Result<bool>> Handle(AlterarSenhaCommand request, CancellationToken ct)
    {
        var usuario = await _repo.ObterPorIdAsync(request.UsuarioId, ct);
        if (usuario is null)
            return Result<bool>.Failure("Usuário não encontrado.");

        if (!_hasher.Verify(request.SenhaAtual, usuario.PasswordHash))
            return Result<bool>.Failure("Senha atual incorreta.");

        var novoHash = _hasher.Hash(request.NovaSenha);
        usuario.AlterarSenha(usuario.PasswordHash, novoHash);

        _repo.Atualizar(usuario);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

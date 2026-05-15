using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Auth.Commands.RegistrarUsuario;

public class RegistrarUsuarioHandler : IRequestHandler<RegistrarUsuarioCommand, Result<Guid>>
{
    private readonly IUsuarioRepository _repo;
    private readonly IPasswordHasher _hasher;
    private readonly IUnitOfWork _uow;

    public RegistrarUsuarioHandler(IUsuarioRepository repo, IPasswordHasher hasher, IUnitOfWork uow)
        => (_repo, _hasher, _uow) = (repo, hasher, uow);

    public async Task<Result<Guid>> Handle(RegistrarUsuarioCommand request, CancellationToken ct)
    {
        if (await _repo.ExisteEmailAsync(request.Email, ct))
            return Result<Guid>.Failure("Email já cadastrado.");

        var hash = _hasher.Hash(request.Senha);
        var result = Usuario.Criar(request.Nome, request.Email, hash, request.Perfil);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }
}

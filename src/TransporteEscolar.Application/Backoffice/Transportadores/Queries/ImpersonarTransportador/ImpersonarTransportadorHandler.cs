using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Queries.ImpersonarTransportador;

public class ImpersonarTransportadorHandler : IRequestHandler<ImpersonarTransportadorQuery, Result<string>>
{
    private readonly ITransportadorRepository _repo;
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly ITokenService _tokenService;

    public ImpersonarTransportadorHandler(ITransportadorRepository repo, IUsuarioRepository usuarioRepo, ITokenService tokenService)
        => (_repo, _usuarioRepo, _tokenService) = (repo, usuarioRepo, tokenService);

    public async Task<Result<string>> Handle(ImpersonarTransportadorQuery request, CancellationToken ct)
    {
        var transportador = await _repo.ObterPorIdAsync(request.TransportadorId, ct);
        if (transportador is null)
            return Result<string>.Failure("Transportador não encontrado.");
        if (transportador.Status != StatusTransportador.Ativo)
            return Result<string>.Failure("Não é possível acessar um transportador inativo ou suspenso.");

        var usuarios = await _usuarioRepo.ListarTodosAsync(ct);
        var adminDoTenant = usuarios
            .Where(u => u.TransportadorId == request.TransportadorId && u.Perfil == PerfilUsuario.Admin)
            .FirstOrDefault();

        if (adminDoTenant is null)
            return Result<string>.Failure("Nenhum usuário Admin encontrado para este transportador.");

        var token = _tokenService.GerarToken(adminDoTenant, transportador.TipoOperacao, moduloFinanceiroAtivo: transportador.ModuloFinanceiroAtivo);
        return Result<string>.Success(token);
    }
}

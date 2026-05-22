using MediatR;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.CadastrarTransportador;

public class CadastrarTransportadorHandler : IRequestHandler<CadastrarTransportadorCommand, Result<Guid>>
{
    private readonly ITransportadorRepository _repo;
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPasswordHasher _hasher;
    private readonly IUnitOfWork _uow;
    private readonly IEmailService _emailService;
    private readonly ILogger<CadastrarTransportadorHandler> _logger;

    public CadastrarTransportadorHandler(
        ITransportadorRepository repo,
        IUsuarioRepository usuarioRepo,
        IPasswordHasher hasher,
        IUnitOfWork uow,
        IEmailService emailService,
        ILogger<CadastrarTransportadorHandler> logger)
    {
        _repo = repo;
        _usuarioRepo = usuarioRepo;
        _hasher = hasher;
        _uow = uow;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CadastrarTransportadorCommand request, CancellationToken ct)
    {
        if (await _repo.ExisteEmailAsync(request.Email, ct))
            return Result<Guid>.Failure("Já existe um transportador com este email.");

        if (await _repo.ExisteCpfCnpjAsync(request.CpfCnpj, ct))
            return Result<Guid>.Failure("Já existe um transportador com este CPF/CNPJ.");

        if (await _usuarioRepo.ExisteEmailAsync(request.Email, ct))
            return Result<Guid>.Failure("Este email já está em uso por outro usuário do sistema.");

        var result = Transportador.Criar(request.NomeEmpresa, request.NomeContato, request.CpfCnpj, request.Email, request.Telefone);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        var transportador = result.Value;

        if (request.PlanoId.HasValue)
            transportador.AssociarPlano(request.PlanoId.Value);

        await _repo.AdicionarAsync(transportador, ct);

        var senhaTemp = GerarSenhaAleatoria();
        var usuarioResult = Usuario.Criar(
            request.NomeContato,
            request.Email,
            _hasher.Hash(senhaTemp),
            PerfilUsuario.Admin,
            transportador.Id,
            mustChangePassword: true);

        if (usuarioResult.IsSuccess)
            await _usuarioRepo.AdicionarAsync(usuarioResult.Value, ct);

        await _uow.CommitAsync(ct);

        if (usuarioResult.IsSuccess)
        {
            try { await _emailService.EnviarAcessoResponsavelAsync(request.Email, request.NomeContato, senhaTemp, ct); }
            catch (Exception ex) { _logger.LogWarning(ex, "Email de acesso não enviado para o transportador {Email}", request.Email); }
        }

        return Result<Guid>.Success(transportador.Id);
    }

    private static string GerarSenhaAleatoria()
    {
        const string chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        return new string(Enumerable.Range(0, 10).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
    }
}

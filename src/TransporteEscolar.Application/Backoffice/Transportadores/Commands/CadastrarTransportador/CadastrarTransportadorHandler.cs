using MediatR;
using Microsoft.Extensions.DependencyInjection;
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
    private readonly IEmailLogRepository _emailLogRepo;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<CadastrarTransportadorHandler> _logger;

    public CadastrarTransportadorHandler(
        ITransportadorRepository repo,
        IUsuarioRepository usuarioRepo,
        IPasswordHasher hasher,
        IUnitOfWork uow,
        IEmailService emailService,
        IEmailLogRepository emailLogRepo,
        IServiceScopeFactory scopeFactory,
        ILogger<CadastrarTransportadorHandler> logger)
    {
        _repo = repo;
        _usuarioRepo = usuarioRepo;
        _hasher = hasher;
        _uow = uow;
        _emailService = emailService;
        _emailLogRepo = emailLogRepo;
        _scopeFactory = scopeFactory;
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

        var senhaTemp = SenhaPadrao;
        var usuarioResult = Usuario.Criar(
            request.NomeContato,
            request.Email,
            _hasher.Hash(senhaTemp),
            PerfilUsuario.Admin,
            transportador.Id,
            mustChangePassword: true);

        if (usuarioResult.IsSuccess)
            await _usuarioRepo.AdicionarAsync(usuarioResult.Value, ct);

        var emailLog = EmailLog.Criar(request.Email, request.NomeContato, transportador.Id);
        await _emailLogRepo.AdicionarAsync(emailLog, ct);

        await _uow.CommitAsync(ct);

        if (usuarioResult.IsSuccess)
        {
            var logId = emailLog.Id;
            var emailService = _emailService;
            var scopeFactory = _scopeFactory;
            var logger = _logger;
            var email = request.Email;
            var nome = request.NomeContato;
            var senha = senhaTemp;

            _ = Task.Run(async () =>
            {
                try
                {
                    await emailService.EnviarAcessoResponsavelAsync(email, nome, senha);

                    using var scope = scopeFactory.CreateScope();
                    var repo = scope.ServiceProvider.GetRequiredService<IEmailLogRepository>();
                    var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    var log = await repo.ObterPorIdAsync(logId);
                    log?.MarcarEnviado();
                    await uow.CommitAsync();
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Email de acesso não enviado para o transportador {Email}", email);
                    try
                    {
                        using var scope = scopeFactory.CreateScope();
                        var repo = scope.ServiceProvider.GetRequiredService<IEmailLogRepository>();
                        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                        var log = await repo.ObterPorIdAsync(logId);
                        log?.MarcarFalha(ex.Message);
                        await uow.CommitAsync();
                    }
                    catch (Exception logEx)
                    {
                        logger.LogError(logEx, "Falha ao atualizar log de email para {Email}", email);
                    }
                }
            });
        }

        return Result<Guid>.Success(transportador.Id);
    }

    private const string SenhaPadrao = "Trans@123";
}

using MediatR;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Motoristas.Commands.CriarAcessoMotorista;

public class CriarAcessoMotoristaHandler : IRequestHandler<CriarAcessoMotoristaCommand, Result<bool>>
{
    private readonly IMotoristaRepository _motoristaRepo;
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IEmailLogRepository _emailLogRepo;
    private readonly IPasswordHasher _hasher;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<CriarAcessoMotoristaHandler> _logger;

    public CriarAcessoMotoristaHandler(
        IMotoristaRepository motoristaRepo,
        IUsuarioRepository usuarioRepo,
        IEmailLogRepository emailLogRepo,
        IPasswordHasher hasher,
        IEmailService emailService,
        IUnitOfWork uow,
        ICurrentTenantService tenant,
        ILogger<CriarAcessoMotoristaHandler> logger)
    {
        (_motoristaRepo, _usuarioRepo, _emailLogRepo, _hasher, _emailService, _uow, _tenant, _logger)
            = (motoristaRepo, usuarioRepo, emailLogRepo, hasher, emailService, uow, tenant, logger);
    }

    public async Task<Result<bool>> Handle(CriarAcessoMotoristaCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<bool>.Failure("Tenant não identificado.");

        var motorista = await _motoristaRepo.ObterPorIdAsync(request.MotoristaId, ct);
        if (motorista is null || motorista.TransportadorId != transportadorId)
            return Result<bool>.Failure("Motorista não encontrado.");

        if (motorista.UsuarioId.HasValue)
            return Result<bool>.Failure("Este motorista já possui acesso ao sistema.");

        var emailNormalizado = request.Email.ToLowerInvariant();
        if (await _usuarioRepo.ExisteEmailAsync(emailNormalizado, ct))
            return Result<bool>.Failure("Já existe um usuário com este email.");

        var senhaTemporaria = SenhaPadrao;
        var hash = _hasher.Hash(senhaTemporaria);
        var usuarioResult = Usuario.Criar(motorista.Nome, emailNormalizado, hash, PerfilUsuario.Motorista, transportadorId, mustChangePassword: true);
        if (!usuarioResult.IsSuccess)
            return Result<bool>.Failure(usuarioResult.Error);

        var usuario = usuarioResult.Value;
        await _usuarioRepo.AdicionarAsync(usuario, ct);
        motorista.VincularUsuario(usuario.Id);

        var emailLog = EmailLog.Criar(emailNormalizado, motorista.Nome, transportadorId);
        await _emailLogRepo.AdicionarAsync(emailLog, ct);
        await _uow.CommitAsync(ct);

        try
        {
            await _emailService.EnviarAcessoResponsavelAsync(emailNormalizado, motorista.Nome, senhaTemporaria, ct);
            emailLog.MarcarEnviado();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao enviar email de acesso para motorista {Email}", emailNormalizado);
            emailLog.MarcarFalha(ex.Message);
        }

        await _uow.CommitAsync(ct);
        return Result<bool>.Success(true);
    }

    private const string SenhaPadrao = "Trans@123";
}

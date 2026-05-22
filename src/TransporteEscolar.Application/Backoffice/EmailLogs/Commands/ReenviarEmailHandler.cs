using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.EmailLogs.Commands;

public class ReenviarEmailHandler : IRequestHandler<ReenviarEmailCommand, Result<bool>>
{
    private readonly IEmailLogRepository _emailLogRepo;
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IPasswordHasher _hasher;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _uow;

    public ReenviarEmailHandler(
        IEmailLogRepository emailLogRepo,
        IUsuarioRepository usuarioRepo,
        IPasswordHasher hasher,
        IEmailService emailService,
        IUnitOfWork uow)
    {
        _emailLogRepo = emailLogRepo;
        _usuarioRepo = usuarioRepo;
        _hasher = hasher;
        _emailService = emailService;
        _uow = uow;
    }

    public async Task<Result<bool>> Handle(ReenviarEmailCommand request, CancellationToken ct)
    {
        var log = await _emailLogRepo.ObterPorIdAsync(request.EmailLogId, ct);
        if (log is null)
            return Result<bool>.Failure("Log de email não encontrado.");

        var usuario = await _usuarioRepo.ObterPorEmailAsync(log.Destinatario, ct);
        if (usuario is null)
            return Result<bool>.Failure("Usuário não encontrado para este email.");

        var novaSenha = GerarSenhaAleatoria();
        usuario.RedefinirSenha(_hasher.Hash(novaSenha));
        await _uow.CommitAsync(ct);

        try
        {
            await _emailService.EnviarAcessoResponsavelAsync(log.Destinatario, log.Nome, novaSenha, ct);
            log.MarcarEnviado();
        }
        catch (Exception ex)
        {
            log.MarcarFalha(ex.Message);
            await _uow.CommitAsync(ct);
            return Result<bool>.Failure($"Falha ao reenviar email: {ex.Message}");
        }

        await _uow.CommitAsync(ct);
        return Result<bool>.Success(true);
    }

    private static string GerarSenhaAleatoria()
    {
        const string chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        return new string(Enumerable.Range(0, 10).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
    }
}

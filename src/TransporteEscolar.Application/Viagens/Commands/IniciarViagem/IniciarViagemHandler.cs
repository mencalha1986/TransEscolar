using MediatR;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Commands.IniciarViagem;

public class IniciarViagemHandler : IRequestHandler<IniciarViagemCommand, Result<Guid>>
{
    private readonly IViagemRepository _viagemRepo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IEmailService _email;
    private readonly INotificacaoPushService _push;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<IniciarViagemHandler> _logger;

    public IniciarViagemHandler(
        IViagemRepository viagemRepo, IAlunoRepository alunoRepo,
        IResponsavelRepository responsavelRepo, IUsuarioRepository usuarioRepo,
        IEmailService email, INotificacaoPushService push,
        IUnitOfWork uow, ICurrentTenantService tenant,
        ILogger<IniciarViagemHandler> logger)
        => (_viagemRepo, _alunoRepo, _responsavelRepo, _usuarioRepo, _email, _push, _uow, _tenant, _logger)
            = (viagemRepo, alunoRepo, responsavelRepo, usuarioRepo, email, push, uow, tenant, logger);

    public async Task<Result<Guid>> Handle(IniciarViagemCommand request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<Guid>.Failure("Usuário sem transportador associado.");

        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var existente = await _viagemRepo.ObterAtualAsync(request.Turno, hoje, _tenant.TenantId.Value, ct);
        if (existente != null && existente.Status == StatusViagem.EmRota)
            return Result<Guid>.Failure("Já existe uma viagem em andamento para este turno hoje.");

        var viagem = Viagem.Iniciar(request.Turno, _tenant.TenantId.Value);
        await _viagemRepo.AdicionarAsync(viagem, ct);
        await _uow.CommitAsync(ct);

        await NotificarResponsaveisAsync(request.Turno, _tenant.TenantId.Value, ct);

        return Result<Guid>.Success(viagem.Id);
    }

    private async Task NotificarResponsaveisAsync(TurnoAluno turno, Guid transportadorId, CancellationToken ct)
    {
        try
        {
            var alunos = (await _alunoRepo.ListarTodosAsync(ct))
                .Where(a => a.Turno == turno && a.TransportadorId == transportadorId)
                .ToList();

            var responsavelIds = alunos.SelectMany(a => a.ResponsavelIds).Distinct().ToList();
            if (!responsavelIds.Any()) return;

            var responsaveis = (await _responsavelRepo.ListarPorIdsAsync(responsavelIds, ct)).ToList();
            var turnoLabel = turno.ToString();

            foreach (var resp in responsaveis)
            {
                try { await _email.EnviarTransporteACaminhoAsync(resp.Email, resp.Nome, turnoLabel, ct); }
                catch (Exception ex) { _logger.LogWarning(ex, "Falha ao notificar responsável {Id}", resp.Id); }
            }

            var emails = responsaveis.Select(r => r.Email).ToList();
            var usuarios = await _usuarioRepo.ListarPorEmailsAsync(emails, ct);
            await _push.EnviarParaUsuariosAsync(
                usuarios.Select(u => u.Id),
                "🚌 Transporte a caminho!",
                $"O transporte do turno {turnoLabel} está saindo agora.",
                ct: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao notificar responsáveis na inicialização da viagem");
        }
    }
}

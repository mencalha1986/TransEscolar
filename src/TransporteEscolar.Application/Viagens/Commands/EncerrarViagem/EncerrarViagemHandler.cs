using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Commands.EncerrarViagem;

public class EncerrarViagemHandler : IRequestHandler<EncerrarViagemCommand, Result<bool>>
{
    private readonly IViagemRepository _viagemRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<EncerrarViagemHandler> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public EncerrarViagemHandler(
        IViagemRepository viagemRepo,
        IUnitOfWork uow, ICurrentTenantService tenant,
        ILogger<EncerrarViagemHandler> logger,
        IServiceScopeFactory scopeFactory)
        => (_viagemRepo, _uow, _tenant, _logger, _scopeFactory)
            = (viagemRepo, uow, tenant, logger, scopeFactory);

    public async Task<Result<bool>> Handle(EncerrarViagemCommand request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<bool>.Failure("Usuário sem transportador associado.");

        var viagem = await _viagemRepo.ObterPorIdAsync(request.ViagemId, ct);
        if (viagem == null)
            return Result<bool>.Failure("Viagem não encontrada.");
        if (viagem.Status != StatusViagem.EmRota)
            return Result<bool>.Failure("A viagem não está em andamento.");

        viagem.Concluir();
        _viagemRepo.Atualizar(viagem);
        await _uow.CommitAsync(ct);

        var turno = viagem.Turno;
        var transportadorId = _tenant.TenantId.Value;

        _ = Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var sp = scope.ServiceProvider;
            await NotificarConcluidoAsync(
                sp.GetRequiredService<IAlunoRepository>(),
                sp.GetRequiredService<IResponsavelRepository>(),
                sp.GetRequiredService<IUsuarioRepository>(),
                sp.GetRequiredService<IEmailService>(),
                sp.GetRequiredService<INotificacaoPushService>(),
                sp.GetRequiredService<ILogger<EncerrarViagemHandler>>(),
                turno, transportadorId);
        });

        return Result<bool>.Success(true);
    }

    private static async Task NotificarConcluidoAsync(
        IAlunoRepository alunoRepo, IResponsavelRepository responsavelRepo,
        IUsuarioRepository usuarioRepo, IEmailService email,
        INotificacaoPushService push, ILogger logger,
        TurnoAluno turno, Guid transportadorId)
    {
        try
        {
            var alunos = (await alunoRepo.ListarTodosAsync())
                .Where(a => a.Turno == turno && a.TransportadorId == transportadorId)
                .ToList();

            var responsavelIds = alunos.SelectMany(a => a.ResponsavelIds).Distinct().ToList();
            if (!responsavelIds.Any()) return;

            var responsaveis = (await responsavelRepo.ListarPorIdsAsync(responsavelIds)).ToList();
            var turnoLabel = turno.ToString();

            foreach (var resp in responsaveis)
            {
                try { await email.EnviarTrajretoConcluidoAsync(resp.Email, resp.Nome, turnoLabel); }
                catch (Exception ex) { logger.LogWarning(ex, "Falha ao notificar responsável {Id}", resp.Id); }
            }

            var usuarios = await usuarioRepo.ListarPorEmailsAsync(responsaveis.Select(r => r.Email));
            await push.EnviarParaUsuariosAsync(
                usuarios.Select(u => u.Id),
                "🏁 Trajeto concluído!",
                $"O transporte do turno {turnoLabel} foi concluído.",
                dados: new Dictionary<string, string> { { "tipo", "viagem" } });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao notificar responsáveis no encerramento da viagem");
        }
    }
}

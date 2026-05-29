using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Commands.IniciarViagem;

public class IniciarViagemHandler : IRequestHandler<IniciarViagemCommand, Result<Guid>>
{
    private readonly IViagemRepository _viagemRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<IniciarViagemHandler> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public IniciarViagemHandler(
        IViagemRepository viagemRepo,
        IUnitOfWork uow, ICurrentTenantService tenant,
        ILogger<IniciarViagemHandler> logger,
        IServiceScopeFactory scopeFactory)
        => (_viagemRepo, _uow, _tenant, _logger, _scopeFactory)
            = (viagemRepo, uow, tenant, logger, scopeFactory);

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

        var turno = request.Turno;
        var transportadorId = _tenant.TenantId.Value;

        _ = Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var sp = scope.ServiceProvider;
            await NotificarResponsaveisAsync(
                sp.GetRequiredService<IAlunoRepository>(),
                sp.GetRequiredService<IResponsavelRepository>(),
                sp.GetRequiredService<IUsuarioRepository>(),
                sp.GetRequiredService<IEmailService>(),
                sp.GetRequiredService<INotificacaoPushService>(),
                sp.GetRequiredService<ILogger<IniciarViagemHandler>>(),
                turno, transportadorId);
        });

        return Result<Guid>.Success(viagem.Id);
    }

    private static async Task NotificarResponsaveisAsync(
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
                try { await email.EnviarTransporteACaminhoAsync(resp.Email, resp.Nome, turnoLabel); }
                catch (Exception ex) { logger.LogWarning(ex, "Falha ao notificar responsável {Id}", resp.Id); }
            }

            var usuarios = await usuarioRepo.ListarPorEmailsAsync(responsaveis.Select(r => r.Email));
            await push.EnviarParaUsuariosAsync(
                usuarios.Select(u => u.Id),
                "🚌 Transporte a caminho!",
                $"O transporte do turno {turnoLabel} está saindo agora.",
                dados: new Dictionary<string, string> { { "tipo", "viagem" } });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao notificar responsáveis na inicialização da viagem");
        }
    }
}

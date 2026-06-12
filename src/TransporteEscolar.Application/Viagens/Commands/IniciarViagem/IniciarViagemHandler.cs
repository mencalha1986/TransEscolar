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
    private readonly IRotaRepository _rotaRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<IniciarViagemHandler> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public IniciarViagemHandler(
        IViagemRepository viagemRepo,
        IRotaRepository rotaRepo,
        IUnitOfWork uow, ICurrentTenantService tenant,
        ILogger<IniciarViagemHandler> logger,
        IServiceScopeFactory scopeFactory)
        => (_viagemRepo, _rotaRepo, _uow, _tenant, _logger, _scopeFactory)
            = (viagemRepo, rotaRepo, uow, tenant, logger, scopeFactory);

    public async Task<Result<Guid>> Handle(IniciarViagemCommand request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<Guid>.Failure("Usuário sem transportador associado.");

        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var transportadorId = _tenant.TenantId.Value;
        var motoristaId = _tenant.MotoristaId;

        // Modo frota: motorista com contexto próprio
        if (motoristaId.HasValue)
        {
            if (!request.RotaId.HasValue)
                return Result<Guid>.Failure("Motorista de frota deve informar a rota ao iniciar viagem.");

            var rota = await _rotaRepo.ObterPorIdAsync(request.RotaId.Value, ct);
            if (rota is null || rota.TransportadorId != transportadorId)
                return Result<Guid>.Failure("Rota não encontrada.");

            if (rota.MotoristaId != motoristaId)
                return Result<Guid>.Failure("Esta rota não está atribuída a você.");

            var existenteRota = await _viagemRepo.ObterAtualPorRotaAsync(request.RotaId.Value, hoje, ct);
            if (existenteRota != null)
                return Result<Guid>.Failure("Já existe uma viagem em andamento para esta rota hoje.");

            var viagem = Viagem.Iniciar(rota.Turno, transportadorId, request.RotaId, motoristaId);
            await _viagemRepo.AdicionarAsync(viagem, ct);
            await _uow.CommitAsync(ct);

            var alunoIdsRota = rota.AlunoIds.ToList();
            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var sp = scope.ServiceProvider;
                await NotificarPorAlunoIdsAsync(
                    sp.GetRequiredService<IAlunoRepository>(),
                    sp.GetRequiredService<IResponsavelRepository>(),
                    sp.GetRequiredService<IUsuarioRepository>(),
                    sp.GetRequiredService<IFaltaRepository>(),
                    sp.GetRequiredService<IEmailService>(),
                    sp.GetRequiredService<INotificacaoPushService>(),
                    sp.GetRequiredService<ILogger<IniciarViagemHandler>>(),
                    rota.Turno, transportadorId, alunoIdsRota);
            });

            return Result<Guid>.Success(viagem.Id);
        }

        // Modo autônomo: comportamento original
        var existente = await _viagemRepo.ObterAtualAsync(request.Turno, hoje, transportadorId, ct);
        if (existente != null && existente.Status == StatusViagem.EmRota)
            return Result<Guid>.Failure("Já existe uma viagem em andamento para este turno hoje.");

        var viagemAutonomo = Viagem.Iniciar(request.Turno, transportadorId);
        await _viagemRepo.AdicionarAsync(viagemAutonomo, ct);
        await _uow.CommitAsync(ct);

        var turno = request.Turno;
        _ = Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var sp = scope.ServiceProvider;
            await NotificarResponsaveisAsync(
                sp.GetRequiredService<IAlunoRepository>(),
                sp.GetRequiredService<IResponsavelRepository>(),
                sp.GetRequiredService<IUsuarioRepository>(),
                sp.GetRequiredService<IFaltaRepository>(),
                sp.GetRequiredService<IEmailService>(),
                sp.GetRequiredService<INotificacaoPushService>(),
                sp.GetRequiredService<ILogger<IniciarViagemHandler>>(),
                turno, transportadorId);
        });

        return Result<Guid>.Success(viagemAutonomo.Id);
    }

    private static async Task NotificarPorAlunoIdsAsync(
        IAlunoRepository alunoRepo, IResponsavelRepository responsavelRepo,
        IUsuarioRepository usuarioRepo, IFaltaRepository faltaRepo,
        IEmailService email, INotificacaoPushService push, ILogger logger,
        TurnoAluno turno, Guid transportadorId, IEnumerable<Guid> alunoIds)
    {
        try
        {
            var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
            var ausentes = (await faltaRepo.ListarAlunoIdsFaltantesPorDataAsync(hoje, transportadorId)).ToHashSet();

            var alunos = new List<Domain.Entities.Aluno>();
            foreach (var id in alunoIds.Where(id => !ausentes.Contains(id)))
            {
                var aluno = await alunoRepo.ObterPorIdAsync(id);
                if (aluno is not null) alunos.Add(aluno);
            }

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
            logger.LogError(ex, "Erro ao notificar responsáveis na inicialização da viagem (frota)");
        }
    }

    private static async Task NotificarResponsaveisAsync(
        IAlunoRepository alunoRepo, IResponsavelRepository responsavelRepo,
        IUsuarioRepository usuarioRepo, IFaltaRepository faltaRepo,
        IEmailService email, INotificacaoPushService push, ILogger logger,
        TurnoAluno turno, Guid transportadorId)
    {
        try
        {
            var alunos = (await alunoRepo.ListarTodosAsync())
                .Where(a => a.Turno == turno && a.TransportadorId == transportadorId)
                .ToList();

            var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
            var ausentes = (await faltaRepo.ListarAlunoIdsFaltantesPorDataAsync(hoje, transportadorId)).ToHashSet();
            alunos = alunos.Where(a => !ausentes.Contains(a.Id)).ToList();

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

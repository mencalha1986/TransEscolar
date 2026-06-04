using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Infrastructure.BackgroundJobs;

public class VerificarInadimplenciaJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<VerificarInadimplenciaJob> _logger;

    private static readonly TimeSpan Intervalo = TimeSpan.FromHours(24);
    private static readonly int[] DiasAviso = [7, 1];

    public VerificarInadimplenciaJob(IServiceScopeFactory scopeFactory, ILogger<VerificarInadimplenciaJob> logger)
        => (_scopeFactory, _logger) = (scopeFactory, logger);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Aguarda 30s no startup para não sobrecarregar inicialização
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            await ExecutarVerificacaoAsync(stoppingToken);
            await Task.Delay(Intervalo, stoppingToken);
        }
    }

    private async Task ExecutarVerificacaoAsync(CancellationToken ct)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var assinaturaRepo = scope.ServiceProvider.GetRequiredService<IAssinaturaRepository>();
            var transportadorRepo = scope.ServiceProvider.GetRequiredService<ITransportadorRepository>();
            var planoRepo = scope.ServiceProvider.GetRequiredService<IPlanoRepository>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var agora = DateTime.UtcNow;

            await MarcarInadimplentesAsync(assinaturaRepo, transportadorRepo, planoRepo, emailService, uow, agora, ct);
            await EnviarAvisosVencimentoAsync(assinaturaRepo, transportadorRepo, planoRepo, emailService, agora, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro no job de verificação de inadimplência");
        }
    }

    private async Task MarcarInadimplentesAsync(
        IAssinaturaRepository assinaturaRepo,
        ITransportadorRepository transportadorRepo,
        IPlanoRepository planoRepo,
        IEmailService emailService,
        IUnitOfWork uow,
        DateTime agora,
        CancellationToken ct)
    {
        var vencidas = await assinaturaRepo.ListarAtivasVencidasAsync(agora, ct);

        foreach (var assinatura in vencidas)
        {
            assinatura.AlterarStatus(StatusAssinatura.Inadimplente);
            assinaturaRepo.Atualizar(assinatura);

            _logger.LogWarning("Assinatura {Id} do transportador {TransportadorId} marcada como inadimplente", assinatura.Id, assinatura.TransportadorId);

            try
            {
                var transportador = await transportadorRepo.ObterPorIdAsync(assinatura.TransportadorId, ct);
                var plano = await planoRepo.ObterPorIdAsync(assinatura.PlanoId, ct);
                if (transportador is not null && plano is not null)
                {
                    await emailService.EnviarAssinaturaInadimplenteAsync(
                        transportador.Email,
                        transportador.NomeContato,
                        plano.Nome,
                        assinatura.DataProximoVencimento,
                        ct);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha ao enviar email de inadimplência para transportador {TransportadorId}", assinatura.TransportadorId);
            }
        }

        if (vencidas.Any())
            await uow.CommitAsync(ct);
    }

    private async Task EnviarAvisosVencimentoAsync(
        IAssinaturaRepository assinaturaRepo,
        ITransportadorRepository transportadorRepo,
        IPlanoRepository planoRepo,
        IEmailService emailService,
        DateTime agora,
        CancellationToken ct)
    {
        foreach (var dias in DiasAviso)
        {
            var proximas = await assinaturaRepo.ListarProximasAoVencimentoAsync(agora, dias, ct);

            foreach (var assinatura in proximas)
            {
                // Filtra apenas as que vencem exatamente em `dias` dias (evita reenvio em mesmo dia)
                var diff = (assinatura.DataProximoVencimento.Date - agora.Date).Days;
                if (diff != dias) continue;

                try
                {
                    var transportador = await transportadorRepo.ObterPorIdAsync(assinatura.TransportadorId, ct);
                    var plano = await planoRepo.ObterPorIdAsync(assinatura.PlanoId, ct);
                    if (transportador is not null && plano is not null)
                    {
                        await emailService.EnviarAvisoVencimentoAssinaturaAsync(
                            transportador.Email,
                            transportador.NomeContato,
                            plano.Nome,
                            assinatura.DataProximoVencimento,
                            dias,
                            ct);
                        _logger.LogInformation("Aviso de vencimento ({Dias}d) enviado para transportador {Id}", dias, assinatura.TransportadorId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Falha ao enviar aviso de vencimento para transportador {TransportadorId}", assinatura.TransportadorId);
                }
            }
        }
    }
}

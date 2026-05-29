using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Transporte.Commands.RegistrarCheckIn;

public class RegistrarCheckInHandler : IRequestHandler<RegistrarCheckInCommand, Result<RegistrarCheckInResultDto>>
{
    private readonly ITransporteRepository _repo;
    private readonly IViagemRepository _viagemRepo;
    private readonly IGeocodingService _geocoding;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<RegistrarCheckInHandler> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public RegistrarCheckInHandler(
        ITransporteRepository repo,
        IViagemRepository viagemRepo,
        IGeocodingService geocoding,
        IUnitOfWork uow, ICurrentTenantService tenant,
        ILogger<RegistrarCheckInHandler> logger,
        IServiceScopeFactory scopeFactory)
        => (_repo, _viagemRepo, _geocoding, _uow, _tenant, _logger, _scopeFactory)
            = (repo, viagemRepo, geocoding, uow, tenant, logger, scopeFactory);

    public async Task<Result<RegistrarCheckInResultDto>> Handle(RegistrarCheckInCommand request, CancellationToken ct)
    {
        if (!_tenant.TenantId.HasValue)
            return Result<RegistrarCheckInResultDto>.Failure("Usuário sem transportador associado.");

        string? endereco = null;
        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            try { endereco = await _geocoding.ResolverEnderecoAsync(request.Latitude.Value, request.Longitude.Value, ct); }
            catch (Exception ex) { _logger.LogWarning(ex, "Falha ao resolver endereço no check-in"); }
        }

        var viagemAtual = await _viagemRepo.ObterEmRotaAsync(_tenant.TenantId.Value, ct);

        var checkIn = CheckIn.Registrar(
            request.AlunoId, request.Tipo, _tenant.TenantId.Value,
            request.Latitude, request.Longitude,
            endereco, viagemAtual?.Id);

        await _repo.AdicionarCheckInAsync(checkIn, ct);
        await _uow.CommitAsync(ct);

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
                sp.GetRequiredService<ILogger<RegistrarCheckInHandler>>(),
                request.AlunoId, request.Tipo, checkIn.HoraRegistro, endereco);
        });

        return Result<RegistrarCheckInResultDto>.Success(new RegistrarCheckInResultDto(checkIn.Id, endereco));
    }

    private static async Task NotificarResponsaveisAsync(
        IAlunoRepository alunoRepo, IResponsavelRepository responsavelRepo,
        IUsuarioRepository usuarioRepo, IEmailService email,
        INotificacaoPushService push, ILogger logger,
        Guid alunoId, TipoCheckIn tipo, DateTime hora, string? endereco)
    {
        try
        {
            var aluno = await alunoRepo.ObterPorIdAsync(alunoId);
            if (aluno == null || !aluno.ResponsavelIds.Any()) return;

            var responsaveis = (await responsavelRepo.ListarPorIdsAsync(aluno.ResponsavelIds)).ToList();
            var horaLocal = hora.ToLocalTime().ToString("HH:mm");
            var tipoLabel = tipo.ToString();

            foreach (var resp in responsaveis)
            {
                try { await email.EnviarCheckInAsync(resp.Email, resp.Nome, aluno.Nome, tipoLabel, horaLocal, endereco); }
                catch (Exception ex) { logger.LogWarning(ex, "Falha ao notificar responsável {Id} no check-in", resp.Id); }
            }

            var usuarios = await usuarioRepo.ListarPorEmailsAsync(responsaveis.Select(r => r.Email));
            var usuarioIds = usuarios.Select(u => u.Id).ToList();

            var emoji = tipo == TipoCheckIn.Embarque ? "✅" : "🏠";
            var titulo = tipo == TipoCheckIn.Embarque ? $"{emoji} {aluno.Nome} embarcou!" : $"{emoji} {aluno.Nome} desembarcou!";
            await push.EnviarParaUsuariosAsync(
                usuarioIds, titulo, $"Às {horaLocal}",
                dados: new Dictionary<string, string> { { "tipo", "checkin" } });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao notificar responsáveis no check-in do aluno {AlunoId}", alunoId);
        }
    }
}

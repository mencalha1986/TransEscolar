using MediatR;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Transporte.Commands.RegistrarCheckIn;

public class RegistrarCheckInHandler : IRequestHandler<RegistrarCheckInCommand, Result<RegistrarCheckInResultDto>>
{
    private readonly ITransporteRepository _repo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IViagemRepository _viagemRepo;
    private readonly IGeocodingService _geocoding;
    private readonly IEmailService _email;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<RegistrarCheckInHandler> _logger;

    public RegistrarCheckInHandler(
        ITransporteRepository repo, IAlunoRepository alunoRepo,
        IResponsavelRepository responsavelRepo, IViagemRepository viagemRepo,
        IGeocodingService geocoding, IEmailService email,
        IUnitOfWork uow, ICurrentTenantService tenant,
        ILogger<RegistrarCheckInHandler> logger)
        => (_repo, _alunoRepo, _responsavelRepo, _viagemRepo, _geocoding, _email, _uow, _tenant, _logger)
            = (repo, alunoRepo, responsavelRepo, viagemRepo, geocoding, email, uow, tenant, logger);

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

        _ = NotificarResponsaveisAsync(request.AlunoId, request.Tipo, checkIn.HoraRegistro, endereco, CancellationToken.None);

        return Result<RegistrarCheckInResultDto>.Success(new RegistrarCheckInResultDto(checkIn.Id, endereco));
    }

    private async Task NotificarResponsaveisAsync(Guid alunoId, TipoCheckIn tipo, DateTime hora, string? endereco, CancellationToken ct)
    {
        try
        {
            var aluno = await _alunoRepo.ObterPorIdAsync(alunoId, ct);
            if (aluno == null || !aluno.ResponsavelIds.Any()) return;

            var responsaveis = await _responsavelRepo.ListarPorIdsAsync(aluno.ResponsavelIds, ct);
            var horaLocal = hora.ToLocalTime().ToString("HH:mm");
            var tipoLabel = tipo.ToString();

            foreach (var resp in responsaveis)
            {
                try { await _email.EnviarCheckInAsync(resp.Email, resp.Nome, aluno.Nome, tipoLabel, horaLocal, endereco, ct); }
                catch (Exception ex) { _logger.LogWarning(ex, "Falha ao notificar responsável {Id} no check-in", resp.Id); }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao notificar responsáveis no check-in do aluno {AlunoId}", alunoId);
        }
    }
}

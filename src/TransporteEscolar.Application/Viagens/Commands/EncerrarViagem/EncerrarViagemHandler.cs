using MediatR;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Viagens.Commands.EncerrarViagem;

public class EncerrarViagemHandler : IRequestHandler<EncerrarViagemCommand, Result<bool>>
{
    private readonly IViagemRepository _viagemRepo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IEmailService _email;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<EncerrarViagemHandler> _logger;

    public EncerrarViagemHandler(
        IViagemRepository viagemRepo, IAlunoRepository alunoRepo,
        IResponsavelRepository responsavelRepo, IEmailService email,
        IUnitOfWork uow, ICurrentTenantService tenant,
        ILogger<EncerrarViagemHandler> logger)
        => (_viagemRepo, _alunoRepo, _responsavelRepo, _email, _uow, _tenant, _logger)
            = (viagemRepo, alunoRepo, responsavelRepo, email, uow, tenant, logger);

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

        _ = NotificarConcluidoAsync(viagem.Turno, _tenant.TenantId.Value, CancellationToken.None);

        return Result<bool>.Success(true);
    }

    private async Task NotificarConcluidoAsync(TurnoAluno turno, Guid transportadorId, CancellationToken ct)
    {
        try
        {
            var alunos = (await _alunoRepo.ListarTodosAsync(ct))
                .Where(a => a.Turno == turno && a.TransportadorId == transportadorId)
                .ToList();

            var responsavelIds = alunos.SelectMany(a => a.ResponsavelIds).Distinct().ToList();
            if (!responsavelIds.Any()) return;

            var responsaveis = await _responsavelRepo.ListarPorIdsAsync(responsavelIds, ct);
            var turnoLabel = turno.ToString();

            foreach (var resp in responsaveis)
            {
                try { await _email.EnviarTrajretoConcluidoAsync(resp.Email, resp.Nome, turnoLabel, ct); }
                catch (Exception ex) { _logger.LogWarning(ex, "Falha ao notificar responsável {Id}", resp.Id); }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao notificar responsáveis no encerramento da viagem");
        }
    }
}

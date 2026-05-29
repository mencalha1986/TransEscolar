using MediatR;
using Microsoft.Extensions.Logging;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Recados.Commands.EnviarRecado;

public class EnviarRecadoHandler : IRequestHandler<EnviarRecadoCommand, Result<Guid>>
{
    private readonly IRecadoRepository _repo;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly INotificacaoPushService _push;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<EnviarRecadoHandler> _logger;

    public EnviarRecadoHandler(
        IRecadoRepository repo, IResponsavelRepository responsavelRepo,
        IAlunoRepository alunoRepo, IUsuarioRepository usuarioRepo,
        INotificacaoPushService push,
        IUnitOfWork uow, ICurrentTenantService tenant,
        ILogger<EnviarRecadoHandler> logger)
        => (_repo, _responsavelRepo, _alunoRepo, _usuarioRepo, _push, _uow, _tenant, _logger)
            = (repo, responsavelRepo, alunoRepo, usuarioRepo, push, uow, tenant, logger);

    public async Task<Result<Guid>> Handle(EnviarRecadoCommand request, CancellationToken ct)
    {
        var autorId = _tenant.UsuarioId;
        if (autorId is null) return Result<Guid>.Failure("Usuário não autenticado.");

        var autorNome = _tenant.UsuarioNome ?? "Usuário";
        var perfil = _tenant.UsuarioPerfil;
        var tipo = request.Tipo;
        string? alunoNomes = null;

        if (perfil == PerfilUsuario.Responsavel.ToString())
        {
            tipo = TipoRecado.DoResponsavel;

            var email = _tenant.UsuarioEmail;
            if (!string.IsNullOrWhiteSpace(email))
            {
                var responsavel = await _responsavelRepo.ObterPorEmailAsync(email, ct);
                if (responsavel is not null)
                {
                    var alunos = await _alunoRepo.ListarPorResponsavelAsync(responsavel.Id, ct);
                    if (alunos.Any())
                        alunoNomes = string.Join(", ", alunos.Select(a => a.Nome));
                }
            }
        }

        var transportadorId = _tenant.TenantId ?? Guid.Empty;

        var result = Recado.Criar(
            request.Conteudo, tipo, autorId.Value, autorNome, transportadorId,
            request.DestinatarioUsuarioId, request.TurnoFiltro, request.EscolaFiltroId, alunoNomes);

        if (!result.IsSuccess) return Result<Guid>.Failure(result.Error);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        _ = NotificarAsync(result.Value, tipo, autorNome, transportadorId, request, CancellationToken.None);

        return Result<Guid>.Success(result.Value.Id);
    }

    private async Task NotificarAsync(Recado recado, TipoRecado tipo, string autorNome, Guid transportadorId, EnviarRecadoCommand request, CancellationToken ct)
    {
        try
        {
            var preview = recado.Conteudo.Length > 60 ? recado.Conteudo[..60] + "…" : recado.Conteudo;

            if (tipo == TipoRecado.DoResponsavel)
            {
                // Notifica o transportador (motorista/admin)
                var usuariosTransportador = await _usuarioRepo.ListarPorTransportadorAsync(transportadorId, ct);
                await _push.EnviarParaUsuariosAsync(
                    usuariosTransportador.Select(u => u.Id),
                    $"💬 Mensagem de {autorNome}",
                    preview,
                    ct: ct);
            }
            else if (tipo == TipoRecado.ParaResponsavel && recado.DestinatarioUsuarioId.HasValue)
            {
                // Notifica o responsável destinatário específico
                await _push.EnviarParaUsuariosAsync(
                    [recado.DestinatarioUsuarioId.Value],
                    $"💬 Nova mensagem de {autorNome}",
                    preview,
                    ct: ct);
            }
            else if (tipo == TipoRecado.Geral || tipo == TipoRecado.ParaTurno)
            {
                // Notifica todos os responsáveis (do turno se aplicável)
                var alunos = (await _alunoRepo.ListarTodosAsync(ct))
                    .Where(a => a.TransportadorId == transportadorId &&
                                (request.TurnoFiltro == null || a.Turno == request.TurnoFiltro))
                    .ToList();

                var responsavelIds = alunos.SelectMany(a => a.ResponsavelIds).Distinct().ToList();
                if (!responsavelIds.Any()) return;

                var responsaveis = await _responsavelRepo.ListarPorIdsAsync(responsavelIds, ct);
                var usuarios = await _usuarioRepo.ListarPorEmailsAsync(responsaveis.Select(r => r.Email), ct);
                await _push.EnviarParaUsuariosAsync(
                    usuarios.Select(u => u.Id),
                    $"💬 Nova mensagem de {autorNome}",
                    preview,
                    ct: ct);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar push notification de recado");
        }
    }
}

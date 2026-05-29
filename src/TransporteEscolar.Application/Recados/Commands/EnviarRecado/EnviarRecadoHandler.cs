using MediatR;
using Microsoft.Extensions.DependencyInjection;
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
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;
    private readonly ILogger<EnviarRecadoHandler> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public EnviarRecadoHandler(
        IRecadoRepository repo, IResponsavelRepository responsavelRepo,
        IAlunoRepository alunoRepo,
        IUnitOfWork uow, ICurrentTenantService tenant,
        ILogger<EnviarRecadoHandler> logger,
        IServiceScopeFactory scopeFactory)
        => (_repo, _responsavelRepo, _alunoRepo, _uow, _tenant, _logger, _scopeFactory)
            = (repo, responsavelRepo, alunoRepo, uow, tenant, logger, scopeFactory);

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

        var recadoId = result.Value.Id;
        var conteudo = result.Value.Conteudo;
        var destinatarioId = result.Value.DestinatarioUsuarioId;

        _ = Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var sp = scope.ServiceProvider;
            await NotificarAsync(
                sp.GetRequiredService<IAlunoRepository>(),
                sp.GetRequiredService<IResponsavelRepository>(),
                sp.GetRequiredService<IUsuarioRepository>(),
                sp.GetRequiredService<INotificacaoPushService>(),
                sp.GetRequiredService<ILogger<EnviarRecadoHandler>>(),
                tipo, autorNome, transportadorId, conteudo, destinatarioId, request);
        });

        return Result<Guid>.Success(recadoId);
    }

    private static async Task NotificarAsync(
        IAlunoRepository alunoRepo, IResponsavelRepository responsavelRepo,
        IUsuarioRepository usuarioRepo, INotificacaoPushService push,
        ILogger logger,
        TipoRecado tipo, string autorNome, Guid transportadorId,
        string conteudo, Guid? destinatarioUsuarioId, EnviarRecadoCommand request)
    {
        try
        {
            var preview = conteudo.Length > 60 ? conteudo[..60] + "…" : conteudo;

            if (tipo == TipoRecado.DoResponsavel)
            {
                var usuariosTransportador = await usuarioRepo.ListarPorTransportadorAsync(transportadorId);
                await push.EnviarParaUsuariosAsync(
                    usuariosTransportador.Select(u => u.Id),
                    $"💬 Mensagem de {autorNome}",
                    preview);
            }
            else if (tipo == TipoRecado.ParaResponsavel && destinatarioUsuarioId.HasValue)
            {
                await push.EnviarParaUsuariosAsync(
                    [destinatarioUsuarioId.Value],
                    $"💬 Nova mensagem de {autorNome}",
                    preview);
            }
            else if (tipo == TipoRecado.Geral || tipo == TipoRecado.ParaTurno)
            {
                var alunos = (await alunoRepo.ListarTodosAsync())
                    .Where(a => a.TransportadorId == transportadorId &&
                                (request.TurnoFiltro == null || a.Turno == request.TurnoFiltro))
                    .ToList();

                var responsavelIds = alunos.SelectMany(a => a.ResponsavelIds).Distinct().ToList();
                if (!responsavelIds.Any()) return;

                var responsaveis = await responsavelRepo.ListarPorIdsAsync(responsavelIds);
                var usuarios = await usuarioRepo.ListarPorEmailsAsync(responsaveis.Select(r => r.Email));
                await push.EnviarParaUsuariosAsync(
                    usuarios.Select(u => u.Id),
                    $"💬 Nova mensagem de {autorNome}",
                    preview);
            }
            else if (tipo == TipoRecado.ParaEscola)
            {
                var alunos = (await alunoRepo.ListarTodosAsync())
                    .Where(a => a.TransportadorId == transportadorId &&
                                a.EscolaId == request.EscolaFiltroId)
                    .ToList();

                var responsavelIds = alunos.SelectMany(a => a.ResponsavelIds).Distinct().ToList();
                if (!responsavelIds.Any()) return;

                var responsaveis = await responsavelRepo.ListarPorIdsAsync(responsavelIds);
                var usuarios = await usuarioRepo.ListarPorEmailsAsync(responsaveis.Select(r => r.Email));
                await push.EnviarParaUsuariosAsync(
                    usuarios.Select(u => u.Id),
                    $"💬 Nova mensagem de {autorNome}",
                    preview);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao enviar push notification de recado");
        }
    }
}

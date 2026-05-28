using MediatR;
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

    public EnviarRecadoHandler(IRecadoRepository repo, IResponsavelRepository responsavelRepo, IAlunoRepository alunoRepo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _responsavelRepo, _alunoRepo, _uow, _tenant) = (repo, responsavelRepo, alunoRepo, uow, tenant);

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

        return Result<Guid>.Success(result.Value.Id);
    }
}

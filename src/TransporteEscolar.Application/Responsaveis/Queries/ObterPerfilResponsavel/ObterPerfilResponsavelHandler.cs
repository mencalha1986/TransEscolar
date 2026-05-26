using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Responsaveis.Queries.ObterPerfilResponsavel;

public class ObterPerfilResponsavelHandler : IRequestHandler<ObterPerfilResponsavelQuery, Result<PerfilResponsavelDto>>
{
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly ICurrentTenantService _tenant;

    public ObterPerfilResponsavelHandler(
        IResponsavelRepository responsavelRepo,
        IAlunoRepository alunoRepo,
        ICurrentTenantService tenant)
        => (_responsavelRepo, _alunoRepo, _tenant) = (responsavelRepo, alunoRepo, tenant);

    public async Task<Result<PerfilResponsavelDto>> Handle(ObterPerfilResponsavelQuery request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_tenant.UsuarioEmail))
            return Result<PerfilResponsavelDto>.Failure("Email do usuário não disponível.");

        var responsavel = await _responsavelRepo.ObterPorEmailAsync(_tenant.UsuarioEmail, ct);
        if (responsavel == null)
            return Result<PerfilResponsavelDto>.Failure("Perfil de responsável não encontrado.");

        var alunos = await _alunoRepo.ListarPorResponsavelAsync(responsavel.Id, ct);

        var dto = new PerfilResponsavelDto(
            responsavel.Id,
            responsavel.Nome,
            alunos.Select(a => new AlunoResumoDto(a.Id, a.Nome, a.Turno.ToString())));

        return Result<PerfilResponsavelDto>.Success(dto);
    }
}

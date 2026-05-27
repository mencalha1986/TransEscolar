using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Responsaveis.Queries.ObterPerfilResponsavel;

public class ObterPerfilResponsavelHandler : IRequestHandler<ObterPerfilResponsavelQuery, Result<PerfilResponsavelDto>>
{
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly ITransportadorRepository _transportadorRepo;
    private readonly ICurrentTenantService _tenant;

    public ObterPerfilResponsavelHandler(
        IResponsavelRepository responsavelRepo,
        IAlunoRepository alunoRepo,
        ITransportadorRepository transportadorRepo,
        ICurrentTenantService tenant)
        => (_responsavelRepo, _alunoRepo, _transportadorRepo, _tenant) = (responsavelRepo, alunoRepo, transportadorRepo, tenant);

    public async Task<Result<PerfilResponsavelDto>> Handle(ObterPerfilResponsavelQuery request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_tenant.UsuarioEmail))
            return Result<PerfilResponsavelDto>.Failure("Email do usuário não disponível.");

        var responsavel = await _responsavelRepo.ObterPorEmailAsync(_tenant.UsuarioEmail, ct);
        if (responsavel == null)
            return Result<PerfilResponsavelDto>.Failure("Perfil de responsável não encontrado.");

        var alunos = await _alunoRepo.ListarPorResponsavelAsync(responsavel.Id, ct);

        TransportadorContatoDto? transportadorDto = null;
        if (_tenant.TenantId is Guid tenantId)
        {
            var transportador = await _transportadorRepo.ObterPorIdAsync(tenantId, ct);
            if (transportador is not null)
                transportadorDto = new TransportadorContatoDto(transportador.NomeEmpresa, transportador.Telefone, transportador.Email);
        }

        var dto = new PerfilResponsavelDto(
            responsavel.Id,
            responsavel.Nome,
            alunos.Select(a => new AlunoResumoDto(a.Id, a.Nome, a.Turno.ToString())),
            transportadorDto);

        return Result<PerfilResponsavelDto>.Success(dto);
    }
}

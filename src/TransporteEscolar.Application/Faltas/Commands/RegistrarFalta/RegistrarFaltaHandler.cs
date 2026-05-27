using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Faltas.Queries.ListarFaltas;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Faltas.Commands.RegistrarFalta;

public class RegistrarFaltaHandler : IRequestHandler<RegistrarFaltaCommand, Result<FaltaDto>>
{
    private readonly IFaltaRepository _repo;
    private readonly IAlunoRepository _alunoRepo;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public RegistrarFaltaHandler(
        IFaltaRepository repo,
        IAlunoRepository alunoRepo,
        IResponsavelRepository responsavelRepo,
        IUnitOfWork uow,
        ICurrentTenantService tenant)
        => (_repo, _alunoRepo, _responsavelRepo, _uow, _tenant) = (repo, alunoRepo, responsavelRepo, uow, tenant);

    public async Task<Result<FaltaDto>> Handle(RegistrarFaltaCommand request, CancellationToken ct)
    {
        var usuarioId = _tenant.UsuarioId;
        if (usuarioId is null) return Result<FaltaDto>.Failure("Usuário não autenticado.");

        var aluno = await _alunoRepo.ObterPorIdAsync(request.AlunoId, ct);
        if (aluno is null) return Result<FaltaDto>.Failure("Aluno não encontrado.");

        var perfil = _tenant.UsuarioPerfil;
        if (perfil == "Responsavel")
        {
            var email = _tenant.UsuarioEmail;
            if (string.IsNullOrWhiteSpace(email))
                return Result<FaltaDto>.Failure("Email do usuário não disponível.");
            var responsavel = await _responsavelRepo.ObterPorEmailAsync(email, ct);
            if (responsavel is null)
                return Result<FaltaDto>.Failure("Perfil de responsável não encontrado.");
            var alunos = await _alunoRepo.ListarPorResponsavelAsync(responsavel.Id, ct);
            if (!alunos.Any(a => a.Id == request.AlunoId))
                return Result<FaltaDto>.Failure("Aluno não vinculado a este responsável.");
        }

        var duplicata = await _repo.ObterPorAlunoEDataAsync(request.AlunoId, request.Data, ct);
        if (duplicata is not null) return Result<FaltaDto>.Failure("Já existe uma falta registrada para este aluno nesta data.");

        var transportadorId = _tenant.TenantId ?? Guid.Empty;
        var falta = Falta.Criar(request.AlunoId, aluno.Nome, usuarioId.Value, request.Data, request.Motivo, transportadorId);

        await _repo.AdicionarAsync(falta, ct);
        await _uow.CommitAsync(ct);

        return Result<FaltaDto>.Success(new FaltaDto(falta.Id, falta.AlunoId, falta.AlunoNome, falta.Data, falta.Motivo, falta.CriadoEm));
    }
}

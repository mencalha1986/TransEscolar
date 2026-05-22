using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Alunos.Commands.DeletarAluno;

public class DeletarAlunoHandler : IRequestHandler<DeletarAlunoCommand, Result<bool>>
{
    private readonly IAlunoRepository _alunoRepo;
    private readonly IMensalidadeRepository _mensalidadeRepo;
    private readonly ITransporteRepository _transporteRepo;
    private readonly IResponsavelRepository _responsavelRepo;
    private readonly IUsuarioRepository _usuarioRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public DeletarAlunoHandler(
        IAlunoRepository alunoRepo,
        IMensalidadeRepository mensalidadeRepo,
        ITransporteRepository transporteRepo,
        IResponsavelRepository responsavelRepo,
        IUsuarioRepository usuarioRepo,
        IUnitOfWork uow,
        ICurrentTenantService tenant)
    {
        _alunoRepo = alunoRepo;
        _mensalidadeRepo = mensalidadeRepo;
        _transporteRepo = transporteRepo;
        _responsavelRepo = responsavelRepo;
        _usuarioRepo = usuarioRepo;
        _uow = uow;
        _tenant = tenant;
    }

    public async Task<Result<bool>> Handle(DeletarAlunoCommand request, CancellationToken ct)
    {
        if (_tenant.TenantId is not Guid transportadorId)
            return Result<bool>.Failure("Tenant não identificado.");

        var aluno = await _alunoRepo.ObterPorIdAsync(request.Id, ct);
        if (aluno is null)
            return Result<bool>.Failure("Aluno não encontrado.");

        if (aluno.TransportadorId != transportadorId)
            return Result<bool>.Failure("Aluno não pertence ao transportador.");

        var responsavelIds = aluno.ResponsavelIds.ToList();

        // Deleta dependentes diretos
        await _mensalidadeRepo.RemoverPorAlunoAsync(request.Id, ct);
        await _transporteRepo.RemoverCheckInsPorAlunoAsync(request.Id, ct);

        // Remove aluno do veículo se estiver associado
        var transporte = await _transporteRepo.ObterPorTransportadorAsync(transportadorId, ct);
        if (transporte is not null && transporte.AlunoIds.Contains(request.Id))
        {
            transporte.RemoverAluno(request.Id);
            _transporteRepo.Atualizar(transporte);
        }

        _alunoRepo.Remover(aluno);
        await _uow.CommitAsync(ct);

        // Remove responsável se não tiver mais nenhum aluno
        foreach (var responsavelId in responsavelIds)
        {
            var count = await _alunoRepo.ContarPorResponsavelAsync(responsavelId, ct);
            if (count > 0) continue;

            var responsavel = await _responsavelRepo.ObterPorIdAsync(responsavelId, ct);
            if (responsavel is null) continue;

            var usuario = await _usuarioRepo.ObterPorEmailAsync(responsavel.Email, ct);
            if (usuario is not null)
                _usuarioRepo.Remover(usuario);

            _responsavelRepo.Remover(responsavel);
        }

        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

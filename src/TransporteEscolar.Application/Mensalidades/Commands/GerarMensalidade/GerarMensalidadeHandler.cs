using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Mensalidades.Commands.GerarMensalidade;

public class GerarMensalidadeHandler : IRequestHandler<GerarMensalidadeCommand, Result<Guid>>
{
    private readonly IAlunoRepository _alunoRepo;
    private readonly IMensalidadeRepository _mensalidadeRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public GerarMensalidadeHandler(IAlunoRepository alunoRepo, IMensalidadeRepository mensalidadeRepo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_alunoRepo, _mensalidadeRepo, _uow, _tenant) = (alunoRepo, mensalidadeRepo, uow, tenant);

    public async Task<Result<Guid>> Handle(GerarMensalidadeCommand request, CancellationToken ct)
    {
        var aluno = await _alunoRepo.ObterPorIdAsync(request.AlunoId, ct);
        if (aluno is null)
            return Result<Guid>.Failure("Aluno não encontrado.");

        var competencia = new DateOnly(request.Ano, request.Mes, 1);

        if (await _mensalidadeRepo.ExisteMensalidadeAsync(request.AlunoId, competencia, ct))
            return Result<Guid>.Failure($"Mensalidade de {request.Mes:D2}/{request.Ano} já gerada para este aluno.");

        var dia = Math.Min(aluno.DiaVencimento, DateTime.DaysInMonth(request.Ano, request.Mes));
        var dataVencimento = new DateOnly(request.Ano, request.Mes, dia);

        var transportadorId = _tenant.TenantId ?? aluno.TransportadorId;
        var result = Mensalidade.Gerar(request.AlunoId, competencia, dataVencimento, aluno.ValorMensalidade, transportadorId);
        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        await _mensalidadeRepo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }
}

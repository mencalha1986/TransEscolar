using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Financeiro.Commands.ExcluirDespesa;

public class ExcluirDespesaHandler : IRequestHandler<ExcluirDespesaCommand, Result<bool>>
{
    private readonly ILancamentoFinanceiroRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public ExcluirDespesaHandler(ILancamentoFinanceiroRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<bool>> Handle(ExcluirDespesaCommand request, CancellationToken ct)
    {
        var lancamento = await _repo.ObterPorIdAsync(request.Id, ct);
        if (lancamento is null)
            return Result<bool>.Failure("Lançamento não encontrado.");

        if (lancamento.TransportadorId != _tenant.TenantId)
            return Result<bool>.Failure("Acesso negado.");

        _repo.Remover(lancamento);
        await _uow.CommitAsync(ct);

        return Result<bool>.Success(true);
    }
}

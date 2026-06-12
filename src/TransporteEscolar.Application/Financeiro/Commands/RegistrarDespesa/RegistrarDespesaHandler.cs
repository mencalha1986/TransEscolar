using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Financeiro.Commands.RegistrarDespesa;

public class RegistrarDespesaHandler : IRequestHandler<RegistrarDespesaCommand, Result<Guid>>
{
    private readonly ILancamentoFinanceiroRepository _repo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentTenantService _tenant;

    public RegistrarDespesaHandler(ILancamentoFinanceiroRepository repo, IUnitOfWork uow, ICurrentTenantService tenant)
        => (_repo, _uow, _tenant) = (repo, uow, tenant);

    public async Task<Result<Guid>> Handle(RegistrarDespesaCommand request, CancellationToken ct)
    {
        var result = LancamentoFinanceiro.Criar(
            _tenant.TenantId!.Value,
            request.Tipo,
            request.Descricao,
            request.Valor,
            request.DataLancamento,
            request.TransporteId,
            request.Observacao);

        if (!result.IsSuccess)
            return Result<Guid>.Failure(result.Error);

        await _repo.AdicionarAsync(result.Value, ct);
        await _uow.CommitAsync(ct);

        return Result<Guid>.Success(result.Value.Id);
    }
}

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Financeiro.Queries.ListarDespesas;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Financeiro.Queries.ObterDespesa;

public class ObterDespesaHandler : IRequestHandler<ObterDespesaQuery, Result<LancamentoFinanceiroDto>>
{
    private readonly ILancamentoFinanceiroRepository _repo;
    private readonly ITransporteRepository _transporteRepo;
    private readonly ICurrentTenantService _tenant;

    public ObterDespesaHandler(ILancamentoFinanceiroRepository repo, ITransporteRepository transporteRepo, ICurrentTenantService tenant)
        => (_repo, _transporteRepo, _tenant) = (repo, transporteRepo, tenant);

    public async Task<Result<LancamentoFinanceiroDto>> Handle(ObterDespesaQuery request, CancellationToken ct)
    {
        var lancamento = await _repo.ObterPorIdAsync(request.Id, ct);
        if (lancamento is null)
            return Result<LancamentoFinanceiroDto>.Failure("Lançamento não encontrado.");

        if (!_tenant.IsSuperAdmin && lancamento.TransportadorId != _tenant.TenantId)
            return Result<LancamentoFinanceiroDto>.Failure("Acesso negado.");

        string? placa = null;
        if (lancamento.TransporteId.HasValue)
        {
            var transporte = await _transporteRepo.ObterPorIdAsync(lancamento.TransporteId.Value, ct);
            placa = transporte?.Placa;
        }

        var dto = new LancamentoFinanceiroDto(
            lancamento.Id,
            lancamento.Tipo,
            lancamento.Tipo.ToString(),
            lancamento.Descricao,
            lancamento.Valor,
            lancamento.DataLancamento,
            lancamento.TransporteId,
            placa,
            lancamento.Observacao,
            lancamento.CriadoEm);

        return Result<LancamentoFinanceiroDto>.Success(dto);
    }
}

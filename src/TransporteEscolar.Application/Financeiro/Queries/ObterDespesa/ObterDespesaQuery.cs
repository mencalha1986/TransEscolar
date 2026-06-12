using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Financeiro.Queries.ListarDespesas;

namespace TransporteEscolar.Application.Financeiro.Queries.ObterDespesa;

public record ObterDespesaQuery(Guid Id) : IRequest<Result<LancamentoFinanceiroDto>>;

using MediatR;

namespace TransporteEscolar.Application.Financeiro.Queries.ResumoFinanceiro;

public record ResumoFinanceiroQuery(DateTime DataInicio, DateTime DataFim) : IRequest<ResumoFinanceiroDto>;

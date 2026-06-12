using MediatR;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Financeiro.Queries.ListarDespesas;

public record ListarDespesasQuery(
    DateTime? DataInicio,
    DateTime? DataFim,
    TipoDespesa? Tipo,
    Guid? TransporteId
) : IRequest<IEnumerable<LancamentoFinanceiroDto>>;

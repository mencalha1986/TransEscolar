using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Financeiro.Queries.ResumoFinanceiro;

public record ResumoFinanceiroDto(
    decimal TotalGeral,
    Dictionary<string, decimal> TotalPorTipo,
    Dictionary<string, decimal> TotalPorVeiculo
);

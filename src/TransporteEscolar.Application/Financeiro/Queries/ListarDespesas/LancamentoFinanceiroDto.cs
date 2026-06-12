using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Financeiro.Queries.ListarDespesas;

public record LancamentoFinanceiroDto(
    Guid Id,
    TipoDespesa Tipo,
    string TipoDescricao,
    string Descricao,
    decimal Valor,
    DateTime DataLancamento,
    Guid? TransporteId,
    string? PlacaVeiculo,
    string? Observacao,
    DateTime CriadoEm
);

using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum TipoDespesa
{
    Combustivel = 1,
    Pedagio = 2,
    Manutencao = 3,
    Seguro = 4,
    IPVA = 5,
    Multa = 6,
    Lavagem = 7,
    Outro = 99
}

public class LancamentoFinanceiro : Entity
{
    public Guid TransportadorId { get; private set; }
    public Guid? TransporteId { get; private set; }
    public TipoDespesa Tipo { get; private set; }
    public string Descricao { get; private set; } = default!;
    public decimal Valor { get; private set; }
    public DateTime DataLancamento { get; private set; }
    public string? Observacao { get; private set; }

    private LancamentoFinanceiro() { }

    public static Result<LancamentoFinanceiro> Criar(
        Guid transportadorId,
        TipoDespesa tipo,
        string descricao,
        decimal valor,
        DateTime dataLancamento,
        Guid? transporteId = null,
        string? observacao = null)
    {
        if (transportadorId == Guid.Empty)
            return Result<LancamentoFinanceiro>.Failure("Transportador é obrigatório.");
        if (string.IsNullOrWhiteSpace(descricao))
            return Result<LancamentoFinanceiro>.Failure("Descrição é obrigatória.");
        if (valor <= 0)
            return Result<LancamentoFinanceiro>.Failure("Valor deve ser maior que zero.");

        return Result<LancamentoFinanceiro>.Success(new LancamentoFinanceiro
        {
            TransportadorId = transportadorId,
            TransporteId = transporteId,
            Tipo = tipo,
            Descricao = descricao.Trim(),
            Valor = valor,
            DataLancamento = dataLancamento.Date == default ? DateTime.UtcNow.Date : dataLancamento.Date,
            Observacao = observacao?.Trim()
        });
    }

    public Result<bool> Atualizar(TipoDespesa tipo, string descricao, decimal valor, DateTime dataLancamento, Guid? transporteId, string? observacao)
    {
        if (string.IsNullOrWhiteSpace(descricao))
            return Result<bool>.Failure("Descrição é obrigatória.");
        if (valor <= 0)
            return Result<bool>.Failure("Valor deve ser maior que zero.");

        Tipo = tipo;
        Descricao = descricao.Trim();
        Valor = valor;
        DataLancamento = dataLancamento.Date;
        TransporteId = transporteId;
        Observacao = observacao?.Trim();
        MarcarAtualizado();
        return Result<bool>.Success(true);
    }
}

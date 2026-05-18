using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public class PagamentoAssinatura : Entity
{
    public Guid AssinaturaId { get; private set; }
    public DateTime DataPagamento { get; private set; }
    public int CompetenciaMes { get; private set; }
    public int CompetenciaAno { get; private set; }
    public decimal ValorPago { get; private set; }
    public string? Observacao { get; private set; }

    private PagamentoAssinatura() { }

    public static Result<PagamentoAssinatura> Criar(Guid assinaturaId, decimal valorPago, int competenciaMes, int competenciaAno, string? observacao = null)
    {
        if (assinaturaId == Guid.Empty)
            return Result<PagamentoAssinatura>.Failure("AssinaturaId inválido.");
        if (valorPago <= 0)
            return Result<PagamentoAssinatura>.Failure("Valor pago deve ser positivo.");
        if (competenciaMes < 1 || competenciaMes > 12)
            return Result<PagamentoAssinatura>.Failure("Mês de competência inválido.");

        return Result<PagamentoAssinatura>.Success(new PagamentoAssinatura
        {
            AssinaturaId = assinaturaId,
            DataPagamento = DateTime.UtcNow,
            CompetenciaMes = competenciaMes,
            CompetenciaAno = competenciaAno,
            ValorPago = valorPago,
            Observacao = observacao
        });
    }
}

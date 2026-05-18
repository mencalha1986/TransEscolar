using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum StatusMensalidade { Pendente, Pago, Atrasado }

public class Mensalidade : Entity
{
    public Guid AlunoId { get; private set; }
    public DateOnly Competencia { get; private set; }
    public DateOnly DataVencimento { get; private set; }
    public decimal Valor { get; private set; }
    public StatusMensalidade Status { get; private set; }
    public DateOnly? DataPagamento { get; private set; }
    public Guid TransportadorId { get; private set; }

    private Mensalidade() { }

    public static Result<Mensalidade> Gerar(Guid alunoId, DateOnly competencia, DateOnly dataVencimento, decimal valor, Guid transportadorId)
    {
        if (alunoId == Guid.Empty)
            return Result<Mensalidade>.Failure("AlunoId inválido.");
        if (valor <= 0)
            return Result<Mensalidade>.Failure("Valor da mensalidade deve ser maior que zero.");

        return Result<Mensalidade>.Success(new Mensalidade
        {
            AlunoId = alunoId,
            Competencia = competencia,
            DataVencimento = dataVencimento,
            Valor = valor,
            Status = StatusMensalidade.Pendente,
            TransportadorId = transportadorId
        });
    }

    public Result<bool> RegistrarPagamento(DateOnly dataPagamento)
    {
        if (Status == StatusMensalidade.Pago)
            return Result<bool>.Failure("Mensalidade já está paga.");

        Status = StatusMensalidade.Pago;
        DataPagamento = dataPagamento;
        MarcarAtualizado();
        return Result<bool>.Success(true);
    }

    public void AtualizarStatus()
    {
        if (Status == StatusMensalidade.Pendente && DataVencimento < DateOnly.FromDateTime(DateTime.UtcNow))
        {
            Status = StatusMensalidade.Atrasado;
            MarcarAtualizado();
        }
    }
}

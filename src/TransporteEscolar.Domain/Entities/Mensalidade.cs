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

    public string? PixCobrancaId { get; private set; }
    public string? PixBrCode { get; private set; }
    public string? PixBrCodeBase64 { get; private set; }
    public DateTime? PixExpiresAt { get; private set; }

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

    public void RegistrarPix(string pixId, string brCode, string brCodeBase64, DateTime expiresAt)
    {
        PixCobrancaId = pixId;
        PixBrCode = brCode;
        PixBrCodeBase64 = brCodeBase64;
        PixExpiresAt = expiresAt;
        MarcarAtualizado();
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

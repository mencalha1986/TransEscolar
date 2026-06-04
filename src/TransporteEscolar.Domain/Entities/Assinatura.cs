using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum StatusAssinatura { Ativa, Inadimplente, Cancelada }

public class Assinatura : Entity
{
    public Guid TransportadorId { get; private set; }
    public Guid PlanoId { get; private set; }
    public DateTime DataInicio { get; private set; }
    public DateTime DataProximoVencimento { get; private set; }
    public StatusAssinatura Status { get; private set; }
    public decimal ValorContratado { get; private set; }

    public string? PixCobrancaId { get; private set; }
    public string? PixBrCode { get; private set; }
    public string? PixBrCodeBase64 { get; private set; }
    public DateTime? PixExpiresAt { get; private set; }

    private Assinatura() { }

    public static Result<Assinatura> Criar(Guid transportadorId, Guid planoId, decimal valorContratado, DateTime dataInicio)
    {
        if (transportadorId == Guid.Empty)
            return Result<Assinatura>.Failure("TransportadorId inválido.");
        if (planoId == Guid.Empty)
            return Result<Assinatura>.Failure("PlanoId inválido.");
        if (valorContratado < 0)
            return Result<Assinatura>.Failure("Valor contratado inválido.");

        return Result<Assinatura>.Success(new Assinatura
        {
            TransportadorId = transportadorId,
            PlanoId = planoId,
            ValorContratado = valorContratado,
            DataInicio = dataInicio,
            DataProximoVencimento = dataInicio.AddMonths(1),
            Status = StatusAssinatura.Ativa
        });
    }

    public void RegistrarPix(string pixId, string brCode, string brCodeBase64, DateTime expiresAt)
    {
        PixCobrancaId = pixId;
        PixBrCode = brCode;
        PixBrCodeBase64 = brCodeBase64;
        PixExpiresAt = expiresAt;
        MarcarAtualizado();
    }

    public void AlterarStatus(StatusAssinatura status) { Status = status; MarcarAtualizado(); }

    public void RegistrarPagamento()
    {
        DataProximoVencimento = DataProximoVencimento.AddMonths(1);
        Status = StatusAssinatura.Ativa;
        MarcarAtualizado();
    }

    public void AlterarPlano(Guid planoId, decimal novoValor)
    {
        PlanoId = planoId;
        ValorContratado = novoValor;
        MarcarAtualizado();
    }
}

using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum StatusEmailLog { Pendente, Enviado, Falha }

public class EmailLog : Entity
{
    public string Destinatario { get; private set; } = default!;
    public string Nome { get; private set; } = default!;
    public Guid TransportadorId { get; private set; }
    public StatusEmailLog Status { get; private set; }
    public string? ErroMensagem { get; private set; }
    public DateTime? EnviadoEm { get; private set; }

    private EmailLog() { }

    public static EmailLog Criar(string destinatario, string nome, Guid transportadorId)
    {
        return new EmailLog
        {
            Destinatario = destinatario,
            Nome = nome,
            TransportadorId = transportadorId,
            Status = StatusEmailLog.Pendente,
        };
    }

    public void MarcarEnviado()
    {
        Status = StatusEmailLog.Enviado;
        EnviadoEm = DateTime.UtcNow;
        ErroMensagem = null;
        MarcarAtualizado();
    }

    public void MarcarFalha(string erro)
    {
        Status = StatusEmailLog.Falha;
        ErroMensagem = erro;
        MarcarAtualizado();
    }
}

namespace TransporteEscolar.Domain.Common;

public abstract class Entity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CriadoEm { get; protected set; } = DateTime.UtcNow;
    public DateTime AtualizadoEm { get; protected set; } = DateTime.UtcNow;

    protected void MarcarAtualizado() => AtualizadoEm = DateTime.UtcNow;
}

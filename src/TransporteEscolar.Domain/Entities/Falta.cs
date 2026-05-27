using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public class Falta : Entity
{
    public Guid AlunoId { get; private set; }
    public string AlunoNome { get; private set; } = default!;
    public Guid ResponsavelId { get; private set; }
    public DateOnly Data { get; private set; }
    public string? Motivo { get; private set; }
    public Guid TransportadorId { get; private set; }

    private Falta() { }

    public static Falta Criar(Guid alunoId, string alunoNome, Guid responsavelId, DateOnly data, string? motivo, Guid transportadorId)
        => new()
        {
            AlunoId = alunoId,
            AlunoNome = alunoNome,
            ResponsavelId = responsavelId,
            Data = data,
            Motivo = motivo,
            TransportadorId = transportadorId,
        };
}

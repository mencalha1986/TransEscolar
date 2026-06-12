using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public class Rota : Entity
{
    public string Nome { get; private set; } = default!;
    public TurnoAluno Turno { get; private set; }
    public Guid TransportadorId { get; private set; }
    public Guid? MotoristaId { get; private set; }
    public Guid? TransporteId { get; private set; }
    private readonly List<Guid> _alunoIds = new();
    public IReadOnlyList<Guid> AlunoIds => _alunoIds.AsReadOnly();

    private Rota() { }

    public static Result<Rota> Criar(string nome, TurnoAluno turno, Guid transportadorId, Guid? motoristaId = null, Guid? transporteId = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result<Rota>.Failure("Nome da rota é obrigatório.");

        return Result<Rota>.Success(new Rota
        {
            Nome = nome,
            Turno = turno,
            TransportadorId = transportadorId,
            MotoristaId = motoristaId,
            TransporteId = transporteId
        });
    }

    public void Atualizar(string nome, TurnoAluno turno, Guid? motoristaId, Guid? transporteId)
    {
        Nome = nome;
        Turno = turno;
        MotoristaId = motoristaId;
        TransporteId = transporteId;
        MarcarAtualizado();
    }

    public void AdicionarAluno(Guid alunoId)
    {
        if (!_alunoIds.Contains(alunoId))
            _alunoIds.Add(alunoId);
        MarcarAtualizado();
    }

    public void RemoverAluno(Guid alunoId)
    {
        _alunoIds.Remove(alunoId);
        MarcarAtualizado();
    }
}

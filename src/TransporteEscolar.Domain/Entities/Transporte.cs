using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum StatusTransporte { Aguardando, EmRota, Concluido }

public class Transporte : Entity
{
    public string Placa { get; private set; } = default!;
    public string NomeMotorista { get; private set; } = default!;
    public int CapacidadeMaxima { get; private set; }
    public StatusTransporte Status { get; private set; } = StatusTransporte.Aguardando;
    private readonly List<Guid> _alunoIds = new();
    public IReadOnlyList<Guid> AlunoIds => _alunoIds.AsReadOnly();
    public Guid TransportadorId { get; private set; }

    private Transporte() { }

    public static Result<Transporte> Criar(string placa, string nomeMotorista, int capacidade, Guid transportadorId)
    {
        if (string.IsNullOrWhiteSpace(placa))
            return Result<Transporte>.Failure("Placa é obrigatória.");
        if (capacidade <= 0)
            return Result<Transporte>.Failure("Capacidade deve ser maior que zero.");

        return Result<Transporte>.Success(new Transporte
        {
            Placa = placa.ToUpper(),
            NomeMotorista = nomeMotorista,
            CapacidadeMaxima = capacidade,
            TransportadorId = transportadorId
        });
    }

    public Result<bool> AdicionarAluno(Guid alunoId)
    {
        if (_alunoIds.Count >= CapacidadeMaxima)
            return Result<bool>.Failure("Capacidade máxima atingida.");
        if (!_alunoIds.Contains(alunoId))
            _alunoIds.Add(alunoId);
        MarcarAtualizado();
        return Result<bool>.Success(true);
    }

    public void IniciarRota() { Status = StatusTransporte.EmRota; MarcarAtualizado(); }
    public void ConcluirRota() { Status = StatusTransporte.Concluido; MarcarAtualizado(); }
}

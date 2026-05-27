using TransporteEscolar.Domain.Common;
using TransporteEscolar.Domain.ValueObjects;

namespace TransporteEscolar.Domain.Entities;

public enum TurnoAluno { Manha, Tarde, Noturno }

public class Aluno : Entity
{
    public string Nome { get; private set; } = default!;
    public DateTime DataNascimento { get; private set; }
    public Guid EscolaId { get; private set; }
    public byte[]? Foto { get; private set; }
    private readonly List<Guid> _responsavelIds = new();
    public IReadOnlyList<Guid> ResponsavelIds => _responsavelIds.AsReadOnly();

    public decimal ValorMensalidade { get; private set; }
    public int DiaVencimento { get; private set; }
    public TurnoAluno Turno { get; private set; }
    public Guid TransportadorId { get; private set; }
    public Endereco? Endereco { get; private set; }

    private Aluno() { }

    public static Result<Aluno> Criar(string nome, DateTime dataNascimento, Guid escolaId, decimal valorMensalidade, int diaVencimento, TurnoAluno turno, Guid transportadorId, byte[]? foto = null, Endereco? endereco = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result<Aluno>.Failure("Nome é obrigatório.");
        if (dataNascimento >= DateTime.UtcNow)
            return Result<Aluno>.Failure("Data de nascimento inválida.");

        return Result<Aluno>.Success(new Aluno
        {
            Nome = nome,
            DataNascimento = DateTime.SpecifyKind(dataNascimento, DateTimeKind.Utc),
            EscolaId = escolaId,
            Foto = foto,
            ValorMensalidade = valorMensalidade,
            DiaVencimento = diaVencimento,
            Turno = turno,
            TransportadorId = transportadorId,
            Endereco = endereco
        });
    }

    public void Atualizar(string nome, DateTime dataNascimento, Guid escolaId, decimal valorMensalidade, int diaVencimento, TurnoAluno turno, Endereco? endereco = null)
    {
        Nome = nome;
        DataNascimento = DateTime.SpecifyKind(dataNascimento, DateTimeKind.Utc);
        EscolaId = escolaId;
        ValorMensalidade = valorMensalidade;
        DiaVencimento = diaVencimento;
        Turno = turno;
        Endereco = endereco;
        MarcarAtualizado();
    }

    public void AtualizarMensalidade(decimal valorMensalidade, int diaVencimento)
    {
        ValorMensalidade = valorMensalidade;
        DiaVencimento = diaVencimento;
        MarcarAtualizado();
    }

    public void AtualizarFoto(byte[] foto)
    {
        Foto = foto;
        MarcarAtualizado();
    }

    public void AssociarResponsavel(Guid responsavelId)
    {
        if (!_responsavelIds.Contains(responsavelId))
            _responsavelIds.Add(responsavelId);
        MarcarAtualizado();
    }
}

using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public class Aluno : Entity
{
    public string Nome { get; private set; } = default!;
    public DateTime DataNascimento { get; private set; }
    public Guid EscolaId { get; private set; }
    public byte[]? Foto { get; private set; }
    private readonly List<Guid> _responsavelIds = new();
    public IReadOnlyList<Guid> ResponsavelIds => _responsavelIds.AsReadOnly();

    private Aluno() { }

    public static Result<Aluno> Criar(string nome, DateTime dataNascimento, Guid escolaId, byte[]? foto = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result<Aluno>.Failure("Nome é obrigatório.");
        if (dataNascimento >= DateTime.UtcNow)
            return Result<Aluno>.Failure("Data de nascimento inválida.");

        return Result<Aluno>.Success(new Aluno
        {
            Nome = nome,
            DataNascimento = dataNascimento,
            EscolaId = escolaId,
            Foto = foto
        });
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

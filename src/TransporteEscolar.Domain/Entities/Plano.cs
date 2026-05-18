using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public class Plano : Entity
{
    public string Nome { get; private set; } = default!;
    public string? Descricao { get; private set; }
    public decimal PrecoMensal { get; private set; }
    public int? LimiteAlunos { get; private set; }
    public bool Ativo { get; private set; }

    private Plano() { }

    public static Result<Plano> Criar(string nome, decimal precoMensal, int? limiteAlunos = null, string? descricao = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result<Plano>.Failure("Nome é obrigatório.");
        if (precoMensal < 0)
            return Result<Plano>.Failure("Preço inválido.");

        return Result<Plano>.Success(new Plano
        {
            Nome = nome,
            Descricao = descricao,
            PrecoMensal = precoMensal,
            LimiteAlunos = limiteAlunos,
            Ativo = true
        });
    }

    public void Atualizar(string nome, decimal precoMensal, int? limiteAlunos, string? descricao)
    {
        Nome = nome;
        PrecoMensal = precoMensal;
        LimiteAlunos = limiteAlunos;
        Descricao = descricao;
        MarcarAtualizado();
    }

    public void Desativar() { Ativo = false; MarcarAtualizado(); }
    public void Ativar() { Ativo = true; MarcarAtualizado(); }
}

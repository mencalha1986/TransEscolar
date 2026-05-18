using TransporteEscolar.Domain.Common;
using TransporteEscolar.Domain.ValueObjects;

namespace TransporteEscolar.Domain.Entities;

public class Responsavel : Entity
{
    public string Nome { get; private set; } = default!;
    public CPF CPF { get; private set; } = default!;
    public string Telefone { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public Endereco Endereco { get; private set; } = default!;
    public Guid TransportadorId { get; private set; }

    private Responsavel() { }

    public void Atualizar(string nome, string telefone, string email)
    {
        Nome = nome;
        Telefone = telefone;
        Email = email;
        MarcarAtualizado();
    }

    public static Result<Responsavel> Criar(string nome, CPF cpf, string telefone, string email, Guid transportadorId, Endereco? endereco = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result<Responsavel>.Failure("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return Result<Responsavel>.Failure("Email inválido.");

        return Result<Responsavel>.Success(new Responsavel
        {
            Nome = nome,
            CPF = cpf,
            Telefone = telefone,
            Email = email,
            Endereco = endereco ?? new Endereco("", "", "", "", "", ""),
            TransportadorId = transportadorId
        });
    }
}

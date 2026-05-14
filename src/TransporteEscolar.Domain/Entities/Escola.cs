using TransporteEscolar.Domain.Common;
using TransporteEscolar.Domain.ValueObjects;

namespace TransporteEscolar.Domain.Entities;

public class Escola : Entity
{
    public string Nome { get; private set; } = default!;
    public Endereco Endereco { get; private set; } = default!;
    public string Telefone { get; private set; } = default!;

    private Escola() { }

    public static Result<Escola> Criar(string nome, Endereco endereco, string telefone)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result<Escola>.Failure("Nome da escola é obrigatório.");
        return Result<Escola>.Success(new Escola { Nome = nome, Endereco = endereco, Telefone = telefone });
    }
}

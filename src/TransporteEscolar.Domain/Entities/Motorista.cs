using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public class Motorista : Entity
{
    public string Nome { get; private set; } = default!;
    public string Cpf { get; private set; } = default!;
    public string? Cnh { get; private set; }
    public string? Telefone { get; private set; }
    public Guid TransportadorId { get; private set; }
    public Guid? UsuarioId { get; private set; }
    public bool Ativo { get; private set; } = true;

    private Motorista() { }

    public static Result<Motorista> Criar(string nome, string cpf, Guid transportadorId, string? cnh = null, string? telefone = null)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return Result<Motorista>.Failure("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(cpf))
            return Result<Motorista>.Failure("CPF é obrigatório.");

        return Result<Motorista>.Success(new Motorista
        {
            Nome = nome,
            Cpf = cpf,
            TransportadorId = transportadorId,
            Cnh = cnh,
            Telefone = telefone
        });
    }

    public void Atualizar(string nome, string? cnh, string? telefone)
    {
        Nome = nome;
        Cnh = cnh;
        Telefone = telefone;
        MarcarAtualizado();
    }

    public void VincularUsuario(Guid usuarioId) { UsuarioId = usuarioId; MarcarAtualizado(); }
    public void Desativar() { Ativo = false; MarcarAtualizado(); }
    public void Ativar() { Ativo = true; MarcarAtualizado(); }
}

using TransporteEscolar.Domain.Common;

namespace TransporteEscolar.Domain.Entities;

public enum StatusTransportador { Ativo, Inativo, Suspenso }

public class Transportador : Entity
{
    public string NomeEmpresa { get; private set; } = default!;
    public string NomeContato { get; private set; } = default!;
    public string CpfCnpj { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string? Telefone { get; private set; }
    public StatusTransportador Status { get; private set; }
    public Guid? PlanoId { get; private set; }
    public bool Vitalicio { get; private set; }

    private Transportador() { }

    public static Result<Transportador> Criar(string nomeEmpresa, string nomeContato, string cpfCnpj, string email, string? telefone = null)
    {
        if (string.IsNullOrWhiteSpace(nomeEmpresa))
            return Result<Transportador>.Failure("Nome da empresa é obrigatório.");
        if (string.IsNullOrWhiteSpace(nomeContato))
            return Result<Transportador>.Failure("Nome do contato é obrigatório.");
        if (string.IsNullOrWhiteSpace(cpfCnpj))
            return Result<Transportador>.Failure("CPF/CNPJ é obrigatório.");
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return Result<Transportador>.Failure("Email inválido.");

        return Result<Transportador>.Success(new Transportador
        {
            NomeEmpresa = nomeEmpresa,
            NomeContato = nomeContato,
            CpfCnpj = cpfCnpj,
            Email = email.ToLowerInvariant(),
            Telefone = telefone,
            Status = StatusTransportador.Ativo
        });
    }

    public void Atualizar(string nomeEmpresa, string nomeContato, string email, string? telefone)
    {
        NomeEmpresa = nomeEmpresa;
        NomeContato = nomeContato;
        Email = email.ToLowerInvariant();
        Telefone = telefone;
        MarcarAtualizado();
    }

    public void AlterarStatus(StatusTransportador status) { Status = status; MarcarAtualizado(); }

    public void AssociarPlano(Guid planoId) { PlanoId = planoId; MarcarAtualizado(); }

    public void MarcarVitalicio() { Vitalicio = true; MarcarAtualizado(); }
    public void RevogarVitalicio() { Vitalicio = false; MarcarAtualizado(); }
}

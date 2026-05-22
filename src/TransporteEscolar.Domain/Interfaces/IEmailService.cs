namespace TransporteEscolar.Domain.Interfaces;

public interface IEmailService
{
    Task EnviarAcessoResponsavelAsync(string email, string nome, string senha, CancellationToken ct = default);
    Task EnviarContatoAsync(string nome, string email, string telefone, string mensagem, CancellationToken ct = default);
}

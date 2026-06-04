namespace TransporteEscolar.Domain.Interfaces;

public interface IEmailService
{
    Task EnviarAcessoResponsavelAsync(string email, string nome, string senha, CancellationToken ct = default);
    Task EnviarContatoAsync(string nome, string email, string telefone, string mensagem, CancellationToken ct = default);
    Task EnviarTransporteACaminhoAsync(string email, string nomeResponsavel, string turno, CancellationToken ct = default);
    Task EnviarCheckInAsync(string email, string nomeResponsavel, string nomeAluno, string tipoCheckIn, string hora, string? endereco, CancellationToken ct = default);
    Task EnviarTrajretoConcluidoAsync(string email, string nomeResponsavel, string turno, CancellationToken ct = default);
    Task EnviarAvisoFaltaAsync(string email, string nomeContato, string nomeAluno, string nomeResponsavel, DateOnly data, string? motivo, CancellationToken ct = default);
    Task EnviarAvisoVencimentoAssinaturaAsync(string email, string nomeContato, string nomePlano, DateTime dataVencimento, int diasRestantes, CancellationToken ct = default);
    Task EnviarAssinaturaInadimplenteAsync(string email, string nomeContato, string nomePlano, DateTime dataVencimento, CancellationToken ct = default);
}

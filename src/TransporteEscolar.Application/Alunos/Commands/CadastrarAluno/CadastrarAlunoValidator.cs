using FluentValidation;

namespace TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;

public class CadastrarAlunoValidator : AbstractValidator<CadastrarAlunoCommand>
{
    public CadastrarAlunoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DataNascimento).LessThan(DateTime.UtcNow);
        RuleFor(x => x.EscolaId).NotEmpty();
        RuleFor(x => x.ValorMensalidade).GreaterThan(0).WithMessage("Valor da mensalidade deve ser maior que zero.");
        RuleFor(x => x.DiaVencimento).InclusiveBetween(1, 28).WithMessage("Dia de vencimento deve ser entre 1 e 28.");
        RuleFor(x => x.Turno).IsInEnum().WithMessage("Turno inválido. Use: Manha, Tarde ou Noturno.");
        RuleFor(x => x.NomeResponsavel).NotEmpty().WithMessage("Nome do responsável é obrigatório.");
        RuleFor(x => x.EmailResponsavel).NotEmpty().WithMessage("Email do responsável é obrigatório.")
            .EmailAddress().WithMessage("Email do responsável inválido.");
        RuleFor(x => x.TelefoneResponsavel).NotEmpty().WithMessage("Telefone do responsável é obrigatório.");
        RuleFor(x => x.CpfResponsavel).NotEmpty().WithMessage("CPF do responsável é obrigatório.")
            .Matches(@"^\d{11}$").WithMessage("CPF do responsável deve ter 11 dígitos.");
    }
}

using FluentValidation;

namespace TransporteEscolar.Application.Alunos.Commands.EditarAluno;

public class EditarAlunoValidator : AbstractValidator<EditarAlunoCommand>
{
    public EditarAlunoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DataNascimento).LessThan(DateTime.UtcNow);
        RuleFor(x => x.EscolaId).NotEmpty();
        RuleFor(x => x.ValorMensalidade).GreaterThan(0);
        RuleFor(x => x.DiaVencimento).InclusiveBetween(1, 28);
        RuleFor(x => x.Turno).IsInEnum();
    }
}

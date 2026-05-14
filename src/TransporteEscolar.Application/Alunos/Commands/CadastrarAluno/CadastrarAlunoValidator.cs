using FluentValidation;

namespace TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;

public class CadastrarAlunoValidator : AbstractValidator<CadastrarAlunoCommand>
{
    public CadastrarAlunoValidator()
    {
        RuleFor(x => x.Nome).NotEmpty().MaximumLength(200);
        RuleFor(x => x.DataNascimento).LessThan(DateTime.UtcNow);
        RuleFor(x => x.EscolaId).NotEmpty();
    }
}

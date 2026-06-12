using FluentValidation;

namespace TransporteEscolar.Application.Financeiro.Commands.AtualizarDespesa;

public class AtualizarDespesaValidator : AbstractValidator<AtualizarDespesaCommand>
{
    public AtualizarDespesaValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Valor).GreaterThan(0).WithMessage("Valor deve ser maior que zero.");
        RuleFor(x => x.DataLancamento).NotEmpty();
    }
}

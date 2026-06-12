using FluentValidation;

namespace TransporteEscolar.Application.Financeiro.Commands.RegistrarDespesa;

public class RegistrarDespesaValidator : AbstractValidator<RegistrarDespesaCommand>
{
    public RegistrarDespesaValidator()
    {
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Valor).GreaterThan(0).WithMessage("Valor deve ser maior que zero.");
        RuleFor(x => x.DataLancamento).NotEmpty();
    }
}

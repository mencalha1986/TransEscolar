using FluentValidation;

namespace TransporteEscolar.Application.Mensalidades.Commands.RegistrarPagamento;

public class RegistrarPagamentoValidator : AbstractValidator<RegistrarPagamentoCommand>
{
    public RegistrarPagamentoValidator()
    {
        RuleFor(x => x.MensalidadeId).NotEmpty();
        RuleFor(x => x.DataPagamento).NotEqual(default(DateOnly)).WithMessage("Data de pagamento inválida.");
    }
}

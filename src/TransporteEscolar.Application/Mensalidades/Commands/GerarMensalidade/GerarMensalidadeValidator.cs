using FluentValidation;

namespace TransporteEscolar.Application.Mensalidades.Commands.GerarMensalidade;

public class GerarMensalidadeValidator : AbstractValidator<GerarMensalidadeCommand>
{
    public GerarMensalidadeValidator()
    {
        RuleFor(x => x.AlunoId).NotEmpty();
        RuleFor(x => x.Ano).InclusiveBetween(2000, 2100).WithMessage("Ano inválido.");
        RuleFor(x => x.Mes).InclusiveBetween(1, 12).WithMessage("Mês deve ser entre 1 e 12.");
    }
}

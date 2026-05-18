using FluentValidation;

namespace TransporteEscolar.Application.Auth.Commands.AlterarSenha;

public class AlterarSenhaValidator : AbstractValidator<AlterarSenhaCommand>
{
    public AlterarSenhaValidator()
    {
        RuleFor(x => x.UsuarioId).NotEmpty();
        RuleFor(x => x.SenhaAtual).NotEmpty();
        RuleFor(x => x.NovaSenha).NotEmpty().MinimumLength(6).WithMessage("Nova senha deve ter pelo menos 6 caracteres.");
    }
}

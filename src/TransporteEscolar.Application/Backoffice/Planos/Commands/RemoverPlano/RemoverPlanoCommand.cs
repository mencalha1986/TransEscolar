using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Planos.Commands.RemoverPlano;

public record RemoverPlanoCommand(Guid PlanoId) : IRequest<Result<bool>>;

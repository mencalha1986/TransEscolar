using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.ModuloFinanceiro.Commands.AtivarModuloFinanceiro;

public record AtivarModuloFinanceiroCommand(Guid TransportadorId) : IRequest<Result<bool>>;

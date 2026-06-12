using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.ModuloFinanceiro.Commands.DesativarModuloFinanceiro;

public record DesativarModuloFinanceiroCommand(Guid TransportadorId) : IRequest<Result<bool>>;

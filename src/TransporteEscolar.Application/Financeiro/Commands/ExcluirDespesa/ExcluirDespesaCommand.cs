using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Financeiro.Commands.ExcluirDespesa;

public record ExcluirDespesaCommand(Guid Id) : IRequest<Result<bool>>;

using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Mensalidades.Commands.ConfirmarPagamentoPix;

public record ConfirmarPagamentoPixCommand(string PixCobrancaId) : IRequest<Result<bool>>;

using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Mensalidades.Commands.RegistrarPagamento;

public record RegistrarPagamentoCommand(Guid MensalidadeId, DateOnly DataPagamento) : IRequest<Result<bool>>;

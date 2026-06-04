using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Commands.ConfirmarPagamentoPixAssinatura;

public record ConfirmarPagamentoPixAssinaturaCommand(string PixCobrancaId) : IRequest<Result<bool>>;

using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Commands.CriarAssinatura;

public record CriarAssinaturaCommand(Guid TransportadorId, Guid PlanoId, decimal ValorContratado)
    : IRequest<Result<Guid>>;

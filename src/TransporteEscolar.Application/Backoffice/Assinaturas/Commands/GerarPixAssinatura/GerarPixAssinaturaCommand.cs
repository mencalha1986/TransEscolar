using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Application.Mensalidades.Commands.GerarPix;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Commands.GerarPixAssinatura;

public record GerarPixAssinaturaCommand(Guid TransportadorId) : IRequest<Result<PixDto>>;

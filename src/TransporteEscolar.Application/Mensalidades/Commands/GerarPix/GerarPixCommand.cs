using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Mensalidades.Commands.GerarPix;

public record GerarPixCommand(Guid MensalidadeId) : IRequest<Result<PixDto>>;

public record PixDto(string BrCode, string BrCodeBase64, DateTime ExpiresAt);

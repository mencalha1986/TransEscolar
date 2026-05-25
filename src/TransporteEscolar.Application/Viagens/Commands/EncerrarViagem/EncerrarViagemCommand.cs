using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Viagens.Commands.EncerrarViagem;

public record EncerrarViagemCommand(Guid ViagemId) : IRequest<Result<bool>>;

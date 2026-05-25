using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Viagens.Commands.AtualizarPosicao;

public record AtualizarPosicaoViagemCommand(Guid ViagemId, double Latitude, double Longitude) : IRequest<Result<bool>>;

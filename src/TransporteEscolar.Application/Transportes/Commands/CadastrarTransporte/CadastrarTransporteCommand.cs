using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Transportes.Commands.CadastrarTransporte;

public record CadastrarTransporteCommand(string Placa, string NomeMotorista, int CapacidadeMaxima)
    : IRequest<Result<Guid>>;

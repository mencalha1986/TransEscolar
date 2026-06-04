using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.AtualizarTransportador;

public record AtualizarTransportadorCommand(
    Guid Id,
    string NomeEmpresa,
    string NomeContato,
    string Email,
    string? Telefone
) : IRequest<Result<bool>>;

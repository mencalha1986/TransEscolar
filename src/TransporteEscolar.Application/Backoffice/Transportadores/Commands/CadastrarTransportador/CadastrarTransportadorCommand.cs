using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.CadastrarTransportador;

public record CadastrarTransportadorCommand(
    string NomeEmpresa,
    string NomeContato,
    string CpfCnpj,
    string Email,
    string? Telefone
) : IRequest<Result<Guid>>;

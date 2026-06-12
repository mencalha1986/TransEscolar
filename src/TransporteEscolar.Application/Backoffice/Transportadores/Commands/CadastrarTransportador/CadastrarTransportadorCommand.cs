using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Backoffice.Transportadores.Commands.CadastrarTransportador;

public record CadastrarTransportadorCommand(
    string NomeEmpresa,
    string NomeContato,
    string CpfCnpj,
    string Email,
    string? Telefone,
    TipoOperacao TipoOperacao = TipoOperacao.Autonomo
) : IRequest<Result<Guid>>;

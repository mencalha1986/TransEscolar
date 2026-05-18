using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Escolas.Commands.AtualizarEscola;

public record AtualizarEscolaCommand(
    Guid Id,
    string Nome,
    string Telefone,
    string Logradouro,
    string Numero,
    string Bairro,
    string Cidade,
    string Estado,
    string CEP) : IRequest<Result<bool>>;

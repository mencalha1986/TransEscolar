using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Escolas.Commands.DeletarEscola;

public record DeletarEscolaCommand(Guid Id) : IRequest<Result<bool>>;

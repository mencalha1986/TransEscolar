using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Mensalidades.Commands.GerarMensalidade;

public record GerarMensalidadeCommand(Guid AlunoId, int Ano, int Mes) : IRequest<Result<Guid>>;

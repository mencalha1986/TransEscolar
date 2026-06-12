using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Rotas.Commands.GerenciarAlunosRota;

public record AdicionarAlunoRotaCommand(Guid RotaId, Guid AlunoId) : IRequest<Result<bool>>;
public record RemoverAlunoRotaCommand(Guid RotaId, Guid AlunoId) : IRequest<Result<bool>>;

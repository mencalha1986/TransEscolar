using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Alunos.Commands.DeletarAluno;

public record DeletarAlunoCommand(Guid Id) : IRequest<Result<bool>>;

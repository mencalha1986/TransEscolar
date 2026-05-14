using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;

public record CadastrarAlunoCommand(
    string Nome,
    DateTime DataNascimento,
    Guid EscolaId,
    byte[]? Foto = null) : IRequest<Result<Guid>>;

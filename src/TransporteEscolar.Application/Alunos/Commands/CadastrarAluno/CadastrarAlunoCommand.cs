using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Alunos.Commands.CadastrarAluno;

public record CadastrarAlunoCommand(
    string Nome,
    DateTime DataNascimento,
    Guid EscolaId,
    decimal ValorMensalidade,
    int DiaVencimento,
    TurnoAluno Turno,
    string EmailResponsavel = "",
    string NomeResponsavel = "",
    string TelefoneResponsavel = "",
    string CpfResponsavel = "",
    byte[]? Foto = null) : IRequest<Result<Guid>>;

using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Alunos.Queries.ObterAluno;

public record ObterAlunoQuery(Guid Id) : IRequest<Result<AlunoDetalheDto>>;

public record ResponsavelDto(Guid Id, string Nome, string CPF, string Telefone, string Email);

public record AlunoDetalheDto(
    Guid Id,
    string Nome,
    DateTime DataNascimento,
    Guid EscolaId,
    string EscolaNome,
    string? FotoBase64,
    decimal ValorMensalidade,
    int DiaVencimento,
    string Turno,
    IReadOnlyList<ResponsavelDto> Responsaveis
);

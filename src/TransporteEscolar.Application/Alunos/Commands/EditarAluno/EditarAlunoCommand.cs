using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Alunos.Commands.EditarAluno;

public record EditarResponsavelDto(Guid Id, string Nome, string Telefone, string Email);
public record NovoResponsavelDto(string Cpf, string Nome, string Telefone, string Email);

public record EditarAlunoCommand(
    Guid Id,
    string Nome,
    DateTime DataNascimento,
    Guid EscolaId,
    decimal ValorMensalidade,
    int DiaVencimento,
    TurnoAluno Turno,
    IReadOnlyList<EditarResponsavelDto>? Responsaveis = null,
    NovoResponsavelDto? NovoResponsavel = null,
    byte[]? Foto = null,
    string? EnderecoLogradouro = null,
    string? EnderecoNumero = null,
    string? EnderecoBairro = null,
    string? EnderecoCidade = null,
    string? EnderecoEstado = null,
    string? EnderecoCEP = null) : IRequest<Result<Guid>>;

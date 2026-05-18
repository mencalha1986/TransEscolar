using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Mensalidades.Queries.ListarMensalidades;

public record MensalidadeDto(
    Guid Id,
    Guid AlunoId,
    string NomeAluno,
    string Turno,
    IReadOnlyList<string> NomesResponsaveis,
    DateOnly Competencia,
    DateOnly DataVencimento,
    decimal Valor,
    string Status,
    DateOnly? DataPagamento);

public record ListarMensalidadesQuery(Guid? AlunoId = null, StatusMensalidade? Status = null)
    : IRequest<Result<IEnumerable<MensalidadeDto>>>;

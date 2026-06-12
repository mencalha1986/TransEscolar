using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Financeiro.Commands.AtualizarDespesa;

public record AtualizarDespesaCommand(
    Guid Id,
    TipoDespesa Tipo,
    string Descricao,
    decimal Valor,
    DateTime DataLancamento,
    Guid? TransporteId,
    string? Observacao
) : IRequest<Result<bool>>;

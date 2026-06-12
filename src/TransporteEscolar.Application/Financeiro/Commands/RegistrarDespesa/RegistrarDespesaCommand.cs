using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Financeiro.Commands.RegistrarDespesa;

public record RegistrarDespesaCommand(
    TipoDespesa Tipo,
    string Descricao,
    decimal Valor,
    DateTime DataLancamento,
    Guid? TransporteId,
    string? Observacao
) : IRequest<Result<Guid>>;

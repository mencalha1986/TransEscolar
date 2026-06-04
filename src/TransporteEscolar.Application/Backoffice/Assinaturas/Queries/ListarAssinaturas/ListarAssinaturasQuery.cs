using MediatR;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Queries.ListarAssinaturas;

public record AssinaturaDto(
    Guid Id,
    Guid TransportadorId,
    string NomeTransportador,
    Guid PlanoId,
    string NomePlano,
    decimal ValorContratado,
    StatusAssinatura Status,
    DateTime DataProximoVencimento
);

public record PagamentoAssinaturaDto(
    Guid Id,
    decimal ValorPago,
    int CompetenciaMes,
    int CompetenciaAno,
    DateTime DataPagamento,
    string? Observacao
);

public record ListarAssinaturasQuery : IRequest<IEnumerable<AssinaturaDto>>;
public record ListarPagamentosAssinaturaQuery(Guid AssinaturaId) : IRequest<IEnumerable<PagamentoAssinaturaDto>>;

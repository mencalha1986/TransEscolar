using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.Assinaturas.Commands.RegistrarPagamentoAssinatura;

public record RegistrarPagamentoAssinaturaCommand(
    Guid AssinaturaId,
    decimal ValorPago,
    int CompetenciaMes,
    int CompetenciaAno,
    string? Observacao
) : IRequest<Result<Guid>>;

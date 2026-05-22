using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.Application.Backoffice.EmailLogs.Queries;

public record EmailLogDto(
    Guid Id,
    string Destinatario,
    string Nome,
    Guid TransportadorId,
    string Status,
    string? ErroMensagem,
    DateTime? EnviadoEm,
    DateTime CriadoEm);

public record ListarEmailLogsQuery : IRequest<Result<List<EmailLogDto>>>;

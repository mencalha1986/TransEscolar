using MediatR;
using TransporteEscolar.Application.Common;

namespace TransporteEscolar.Application.Backoffice.EmailLogs.Commands;

public record ReenviarEmailCommand(Guid EmailLogId) : IRequest<Result<bool>>;

using MediatR;
using TransporteEscolar.Application.Common;
using TransporteEscolar.Domain.Interfaces;

namespace TransporteEscolar.Application.Backoffice.EmailLogs.Queries;

public class ListarEmailLogsHandler : IRequestHandler<ListarEmailLogsQuery, Result<List<EmailLogDto>>>
{
    private readonly IEmailLogRepository _repo;

    public ListarEmailLogsHandler(IEmailLogRepository repo) => _repo = repo;

    public async Task<Result<List<EmailLogDto>>> Handle(ListarEmailLogsQuery request, CancellationToken ct)
    {
        var logs = await _repo.ListarAsync(ct);
        var dtos = logs.Select(l => new EmailLogDto(
            l.Id,
            l.Destinatario,
            l.Nome,
            l.TransportadorId,
            l.Status.ToString(),
            l.ErroMensagem,
            l.EnviadoEm,
            l.CriadoEm)).ToList();

        return Result<List<EmailLogDto>>.Success(dtos);
    }
}

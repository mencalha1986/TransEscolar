using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Transporte.Commands.RegistrarCheckIn;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class TransportesController : BaseController
{
    private readonly IMediator _mediator;

    public TransportesController(IMediator mediator) => _mediator = mediator;

    [HttpPost("{id:guid}/checkins")]
    public async Task<IActionResult> RegistrarCheckIn(Guid id, [FromBody] RegistrarCheckInRequest req, CancellationToken ct)
    {
        var cmd = new RegistrarCheckInCommand(req.AlunoId, id, req.Tipo, req.Latitude, req.Longitude);
        var result = await _mediator.Send(cmd, ct);

        if (!result.IsSuccess)
            return ErrorResponse(result.Error);

        return OkResponse(result.Value);
    }
}

public record RegistrarCheckInRequest(Guid AlunoId, TipoCheckIn Tipo, double? Latitude, double? Longitude);

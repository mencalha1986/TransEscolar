using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Transporte.Commands.RegistrarCheckIn;
using TransporteEscolar.Application.Transporte.Queries.ListarCheckIns;
using TransporteEscolar.Application.Transportes.Queries.ListarTransportes;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class TransportesController : BaseController
{
    private readonly IMediator _mediator;

    public TransportesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarTransportesQuery(), ct);
        return result.IsSuccess ? OkResponse(result.Value) : ErrorResponse(result.Error);
    }

    [HttpGet("checkins")]
    public async Task<IActionResult> ListarCheckIns([FromQuery] DateOnly? data, [FromQuery] string? turno, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarCheckInsQuery(data, turno), ct);
        return result.IsSuccess ? OkResponse(result.Value) : ErrorResponse(result.Error);
    }

    [HttpPost("checkins")]
    public async Task<IActionResult> RegistrarCheckIn([FromBody] RegistrarCheckInRequest req, CancellationToken ct)
    {
        var cmd = new RegistrarCheckInCommand(req.AlunoId, req.Tipo, req.Latitude, req.Longitude);
        var result = await _mediator.Send(cmd, ct);

        if (!result.IsSuccess)
            return ErrorResponse(result.Error);

        return OkResponse(result.Value);
    }
}

public record RegistrarCheckInRequest(Guid AlunoId, TipoCheckIn Tipo, double? Latitude, double? Longitude);

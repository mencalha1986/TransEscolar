using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Faltas.Commands.CancelarFalta;
using TransporteEscolar.Application.Faltas.Commands.DarCienciaFalta;
using TransporteEscolar.Application.Faltas.Commands.RegistrarFalta;
using TransporteEscolar.Application.Faltas.Queries.ListarFaltas;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class FaltasController : BaseController
{
    private readonly IMediator _mediator;

    public FaltasController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] DateOnly? data, [FromQuery] Guid? alunoId, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarFaltasQuery(data, alunoId), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] RegistrarFaltaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new RegistrarFaltaCommand(req.AlunoId, req.Data, req.Motivo), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPut("{id:guid}/ciencia")]
    public async Task<IActionResult> DarCiencia(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DarCienciaFaltaCommand(id), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancelar(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new CancelarFaltaCommand(id), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }
}

public record RegistrarFaltaRequest(Guid AlunoId, DateOnly Data, string? Motivo = null);

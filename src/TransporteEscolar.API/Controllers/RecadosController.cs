using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Recados.Commands.DarCienciaRecado;
using TransporteEscolar.Application.Recados.Commands.DeletarRecado;
using TransporteEscolar.Application.Recados.Commands.EnviarRecado;
using TransporteEscolar.Application.Recados.Queries.ListarRecados;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class RecadosController : BaseController
{
    private readonly IMediator _mediator;

    public RecadosController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Listar(CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarRecadosQuery(), ct);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Enviar([FromBody] EnviarRecadoRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new EnviarRecadoCommand(
            req.Conteudo, req.Tipo, req.DestinatarioUsuarioId, req.TurnoFiltro, req.EscolaFiltroId), ct);

        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deletar(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DeletarRecadoCommand(id), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPost("{id:guid}/ciencia")]
    public async Task<IActionResult> DarCiencia(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new DarCienciaRecadoCommand(id), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }
}

public record EnviarRecadoRequest(
    string Conteudo,
    TipoRecado Tipo,
    Guid? DestinatarioUsuarioId = null,
    TurnoAluno? TurnoFiltro = null,
    Guid? EscolaFiltroId = null);

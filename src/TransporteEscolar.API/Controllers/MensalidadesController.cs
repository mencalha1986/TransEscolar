using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Mensalidades.Commands.GerarMensalidade;
using TransporteEscolar.Application.Mensalidades.Commands.GerarPix;
using TransporteEscolar.Application.Mensalidades.Commands.RegistrarPagamento;
using TransporteEscolar.Application.Mensalidades.Queries.ListarMensalidades;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class MensalidadesController : BaseController
{
    private readonly IMediator _mediator;

    public MensalidadesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] Guid? alunoId, [FromQuery] StatusMensalidade? status, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarMensalidadesQuery(alunoId, status), ct);
        return OkResponse(result.Value);
    }

    [HttpPost("gerar")]
    public async Task<IActionResult> Gerar([FromBody] GerarMensalidadeRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new GerarMensalidadeCommand(req.AlunoId, req.Ano, req.Mes), ct);
        if (!result.IsSuccess)
            return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPatch("{id:guid}/pagar")]
    public async Task<IActionResult> Pagar(Guid id, [FromBody] PagarMensalidadeRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new RegistrarPagamentoCommand(id, req.DataPagamento), ct);
        if (!result.IsSuccess)
            return ErrorResponse(result.Error);
        return OkResponse("Pagamento registrado com sucesso.");
    }
    [HttpPost("{id:guid}/pix")]
    public async Task<IActionResult> GerarPix(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GerarPixCommand(id), ct);
        if (!result.IsSuccess)
            return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }
}

public record GerarMensalidadeRequest(Guid AlunoId, int Ano, int Mes);
public record PagarMensalidadeRequest(DateOnly DataPagamento);

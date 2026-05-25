using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Viagens.Commands.AtualizarPosicao;
using TransporteEscolar.Application.Viagens.Commands.EncerrarViagem;
using TransporteEscolar.Application.Viagens.Commands.IniciarViagem;
using TransporteEscolar.Application.Viagens.Queries.ListarViagens;
using TransporteEscolar.Application.Viagens.Queries.ObterViagemAtual;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/[controller]")]
public class ViagensController : BaseController
{
    private readonly IMediator _mediator;

    public ViagensController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> IniciarViagem([FromBody] IniciarViagemRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new IniciarViagemCommand(req.Turno), ct);
        return result.IsSuccess ? OkResponse(result.Value) : ErrorResponse(result.Error);
    }

    [HttpPut("{id:guid}/posicao")]
    public async Task<IActionResult> AtualizarPosicao(Guid id, [FromBody] AtualizarPosicaoRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new AtualizarPosicaoViagemCommand(id, req.Latitude, req.Longitude), ct);
        return result.IsSuccess ? OkResponse(result.Value) : ErrorResponse(result.Error);
    }

    [HttpPut("{id:guid}/encerrar")]
    public async Task<IActionResult> EncerrarViagem(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new EncerrarViagemCommand(id), ct);
        return result.IsSuccess ? OkResponse(result.Value) : ErrorResponse(result.Error);
    }

    [HttpGet("atual")]
    public async Task<IActionResult> ObterAtual(CancellationToken ct)
    {
        var result = await _mediator.Send(new ObterViagemAtualQuery(), ct);
        return result.IsSuccess ? OkResponse(result.Value) : ErrorResponse(result.Error);
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] DateOnly? data, CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarViagensQuery(data), ct);
        return result.IsSuccess ? OkResponse(result.Value) : ErrorResponse(result.Error);
    }
}

public record IniciarViagemRequest(TurnoAluno Turno);
public record AtualizarPosicaoRequest(double Latitude, double Longitude);

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransporteEscolar.API.Common;
using TransporteEscolar.Application.Financeiro.Commands.AtualizarDespesa;
using TransporteEscolar.Application.Financeiro.Commands.ExcluirDespesa;
using TransporteEscolar.Application.Financeiro.Commands.RegistrarDespesa;
using TransporteEscolar.Application.Financeiro.Queries.ListarDespesas;
using TransporteEscolar.Application.Financeiro.Queries.ObterDespesa;
using TransporteEscolar.Application.Financeiro.Queries.ResumoFinanceiro;
using TransporteEscolar.Domain.Entities;

namespace TransporteEscolar.API.Controllers;

[Authorize]
[Route("api/financeiro")]
public class FinanceiroController : BaseController
{
    private readonly IMediator _mediator;

    public FinanceiroController(IMediator mediator) => _mediator = mediator;

    [HttpPost("despesas")]
    public async Task<IActionResult> RegistrarDespesa([FromBody] RegistrarDespesaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new RegistrarDespesaCommand(
            req.Tipo, req.Descricao, req.Valor, req.DataLancamento, req.TransporteId, req.Observacao), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return CreatedResponse(nameof(ObterDespesa), new { id = result.Value }, result.Value);
    }

    [HttpGet("despesas")]
    public async Task<IActionResult> ListarDespesas(
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] TipoDespesa? tipo,
        [FromQuery] Guid? transporteId,
        CancellationToken ct)
    {
        var result = await _mediator.Send(new ListarDespesasQuery(dataInicio, dataFim, tipo, transporteId), ct);
        return OkResponse(result);
    }

    [HttpGet("despesas/{id:guid}")]
    public async Task<IActionResult> ObterDespesa(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ObterDespesaQuery(id), ct);
        if (!result.IsSuccess) return NotFoundResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpPut("despesas/{id:guid}")]
    public async Task<IActionResult> AtualizarDespesa(Guid id, [FromBody] AtualizarDespesaRequest req, CancellationToken ct)
    {
        var result = await _mediator.Send(new AtualizarDespesaCommand(
            id, req.Tipo, req.Descricao, req.Valor, req.DataLancamento, req.TransporteId, req.Observacao), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpDelete("despesas/{id:guid}")]
    public async Task<IActionResult> ExcluirDespesa(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new ExcluirDespesaCommand(id), ct);
        if (!result.IsSuccess) return ErrorResponse(result.Error);
        return OkResponse(result.Value);
    }

    [HttpGet("resumo")]
    public async Task<IActionResult> Resumo([FromQuery] DateTime dataInicio, [FromQuery] DateTime dataFim, CancellationToken ct)
    {
        var result = await _mediator.Send(new ResumoFinanceiroQuery(dataInicio, dataFim), ct);
        return OkResponse(result);
    }
}

public record RegistrarDespesaRequest(
    TipoDespesa Tipo,
    string Descricao,
    decimal Valor,
    DateTime DataLancamento,
    Guid? TransporteId,
    string? Observacao);

public record AtualizarDespesaRequest(
    TipoDespesa Tipo,
    string Descricao,
    decimal Valor,
    DateTime DataLancamento,
    Guid? TransporteId,
    string? Observacao);
